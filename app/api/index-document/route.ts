import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import pdf from '@cedrugs/pdf-parse';
import { error } from "console";

// Appelée par le dashboard admin lors de l'approbation d'un mémoire
// Body attendu : { documentId: "uuid-du-document" }

export async function POST(request: Request) {
    try {
        const { documenId } = await request.json()
        if (!documenId)
            return NextResponse.json({ error: 'documentId requis' }, { status: 400 })

        // 1- Récupère les métadonnées du document 
        const { data: doc, error: docErr } = await supabaseAdmin
        .from('documents')
        .select('*')
        .eq('id', documenId)
        .single()
        
        if (docErr || !doc)
            return NextResponse.json({ error: 'Document introuvable' }, { status: 404 })

        // 2. Télécharge le pdf depuis supabase Storage
        let fileBlop: Blob | null = null

        // Essaie d'abord dans knoledge-base, puis dans uploads-stagings
        const { data: kb } = await supabaseAdmin.storage
        .from('knowledge-base').download(doc.file_path)
        if (kb) { fileBlop = kb }
        else {
            const { data: staging } = await supabaseAdmin.storage
            .from ('uploads-staging').download(doc.file_path)
            if (staging) fileBlop = staging
        }

        if (!fileBlop)
            return NextResponse.json({ error: 'Fichier PDF introuvable' }, { status: 404 })

        // 3. Extrait le texte brut du PDF
        const buffer = Buffer.from(await fileBlop.arrayBuffer())
        let fullText = ''
        try {
            const data = await pdf(buffer)
            fullText = data.text
        } 
        catch { fullText = '' }

        // 4. Test de densité : moins de 50 Mo = scan
        const wordCount = fullText.trim().split(/\s+/).length

        if (wordCount < 50){
            // Document scanné - on indexe les métadonnées disponibles en attendant l'OCR
            fullText = [
                `Titre: ${doc.title}`,
                `Auteur: ${doc.author_name}`,
                `École: ${doc.school}`,
                `Année: ${doc.promo_year}`,
                `Mots-clés: ${doc.keywords?.join(', ') ?? ''}`,
                `Résumé: ${doc.abstract ?? 'Non fourni'}`,
            ].join('\n')
        }

        // 5. Découpe le texte en chunck de ~1000 caractères 
        const splitIntoChunks = (text: string, maxLen = 1000): string[] => {
            const sentences = text.split(/(?<=[.!?])\s+/)
            const chunks: string[] = []
            let current = ''
            for (const s of sentences) {
                if ((current +s).length > maxLen && current.length > 0) {
                    chunks.push(current.trim())
                    current = ''
                }
                current += s + ''
            }
            if (current.trim()) 
                chunks.push(current.trim())
            return chunks.filter(c => c.length > 80) 
        }
        const chunks = splitIntoChunks(fullText)


        // 6. Génère les embeddings avec @xenova/transformers
        // Modèle gratuit, tourne sur le server, dimension 384
        const { pipeline } = await import('@xenova/transformers')
        const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')

        // 7. Supprime les anciens chunks (si re-indexation)
        await supabaseAdmin.from('document_chunks').delete().eq('document_id', documenId)

        // 8. Insère les chunks + vecteurs par batch de 10
        const records = []
        for (let i = 0; i<chunks.length; i++) {
            const out = await embedder(chunks[i], { pooling: 'mean', normalize: true })
            records.push({
                document_id: documenId,
                content: chunks[i],
                embedding: Array.from(out.data) as number[],
                chunks_index: i,
            })
        }

        for (let i = 0; i < records.length; i++) {
            await supabaseAdmin.from('document_chunks').insert(records.slice(i, i+10))
        }


        return NextResponse.json({
            success: true,
            chunks_created: records.length,
            message: `${records.length} chunks indexés avec succès`
        })
    } 
    catch (err: unknown){
        console.error('[INDEX-DOCUMENT]', err)
        const message = err instanceof Error ? err.message : 'Erreur interne'
        return NextResponse.json({
            error: message
        }, {
            status: 500
        })
    }
}