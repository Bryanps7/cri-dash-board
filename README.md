# CRI Lead Insights

Preciso fazer uma painel de acompanhamento de LEADS para a empresa CRI Soluções Imobiliarias

enviei um PDF com a estilagem atual do site dele para você se basear nas cores elementos e outras coisas.

A ideia principal séria conectar isso a uma TV e poder acompanhar, então na tela principal quando estivesse em tela cheia ativa (1200x900) deveria mostrar todas as informações importantes com pelo menos um gráfico.

Como a pessoa ira acessar pelo computador também deve ter a opção de rolar para baixo e aparecer uma tabela com todos os leads, com barra de busca e filtragem e um bottão de adicionar observação que altera a coluna de observation.

A tela precisa, no mínimo:

Listar os leads cadastrados

• Permitir filtrar por status

• Mostrar, de alguma forma visual, um resumo (ex: quantos leads em cada status)

Essas são as rotas da API:

router.get('/', list)                         // GET   /leads?status=&search=&stale=true

router.get('/quantityStatus', quantityStatus)               // GET   /leads/quantityStatus

router.get('/phone/:phone', getByPhone)       // GET   /leads/phone/48999998888

router.get('/:id', getById)                   // GET   /leads/1

router.post('/', create)                      // POST  /leads

router.put('/:id', update)                    // PUT   /leads/1

router.patch('/:id/contact', registerContact) // PATCH /leads/1/contact

o host dela é : localhost:3000

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9821b0cc-e6a6-4643-8188-1c2b9105dc24).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
