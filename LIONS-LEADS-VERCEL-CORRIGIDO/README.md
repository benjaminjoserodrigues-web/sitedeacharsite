# Lions Leads

Plataforma de prospecção local com Next.js, TypeScript, Tailwind e dados do OpenStreetMap/Overpass.

## Executar

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`. Para validar produção, use `npm run build`.

## Deploy

Importe o repositório na Vercel e mantenha as configurações padrão de Next.js. Para usar a integração com a Groq, adicione `GROQ_API_KEY` em **Project Settings → Environment Variables** e faça um novo deploy.

## Limitações

- Os dados dependem do cadastro colaborativo do OpenStreetMap e podem estar incompletos ou desatualizados.
- Telefones são lidos das tags públicas `phone`, `contact:phone`, `mobile`, `contact:mobile` e `phone:mobile`, validados e formatados no padrão brasileiro. Números ausentes não são inferidos.
- “Site não encontrado” não significa que a empresa não tenha um site.
- Nominatim e Overpass são serviços públicos do OpenStreetMap, possuem limites de uso e podem ficar temporariamente indisponíveis.
- Leads, histórico e preferências ficam somente no `localStorage` do navegador.
