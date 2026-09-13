# Railway — Casa dos Sonhos

Crie um projeto Railway com três serviços a partir do mesmo repositório:

| Serviço | Root Directory | Exposição |
| --- | --- | --- |
| `casa-api` | `/backend-monorepo/golang/casa-dos-sonhos` | projeto `backend-apis-golang`; pública (`api-casadossonhos.systentando.com`) pois `*.railway.internal` não resolve entre projetos |
| `casa-web` | `/projects/construcao/casa-dos-sonhos` | pública, com domínio HTTPS |
| `freds` | `/backend-monorepo/python/freds` | privada; exponha `/mcp` somente se necessário |

1. Em `casa-api`, anexe um Volume em `/data` e defina `CASA_DB_PATH=/data/casa.db`.
2. Em `casa-web`, configure `VITE_API_URL=/gateway` como variável de **build** e `API_URL=https://casa-api-production-4d11.up.railway.app` como variável de runtime. O Caddy encaminha `/gateway/*` para a API (upstream público porque `casa-web` e `casa-api` estão em projetos Railway distintos; se um dia ficarem no mesmo projeto, prefira `http://casa-api.railway.internal:8889`). Faça redeploy do frontend depois de mudar `VITE_API_URL`.
3. Em `freds`, use `CASA_DOS_SONHOS_MCP_URL=https://api-casadossonhos.systentando.com/mcp` (o Freds também está em outro projeto Railway, então `*.railway.internal` não resolve) e crie os segredos indicados em `.env.railway.example` diretamente no Railway.
4. Configure `CORS_ORIGINS` da API com o domínio final do `casa-web` somente se a API também receber chamadas diretas. Pelo gateway, o browser usa same-origin.

Não envie `.env` real, chaves MCP, segredos de guardrail ou credenciais de Mongo para o repositório.
