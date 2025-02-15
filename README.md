# Orbital Architecture Diagram Generator

Uma ferramenta para gerar diagramas de arquitetura no estilo orbital, similar ao C4 Model mas com uma visualização orbital.

## Características

- Geração de diagramas orbitais a partir de arquivos JSON
- Visualização interativa no navegador
- Exportação para SVG
- Suporte a diferentes tamanhos de "planetas" (componentes)
- Personalização de cores e estilos
- Suporte a satélites (sub-componentes)

## Como Usar

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse `http://localhost:3000` no seu navegador

## Estrutura do JSON

O diagrama é definido por um arquivo JSON com a seguinte estrutura:

```json
{
  "center": {
    "name": "Nome do Sistema Central",
    "type": "core",
    "size": "large"
  },
  "orbits": [
    {
      "radius": 1,
      "planets": [
        {
          "name": "Nome do Componente",
          "type": "service",
          "size": "medium",
          "satellites": [
            {
              "name": "Sub-componente",
              "type": "feature"
            }
          ]
        }
      ]
    }
  ],
  "styles": {
    "core": {
      "color": "#FFB900",
      "borderColor": "#000000"
    }
  }
}
```

### Tipos de Componentes

- `core`: Componente central do sistema
- `service`: Serviços ou componentes principais
- `feature`: Funcionalidades ou sub-componentes
- `external`: Sistemas externos

### Tamanhos Disponíveis

- `large`: 60px
- `medium`: 40px
- `small`: 20px

## Desenvolvimento

### Estrutura do Projeto

```
orbital-diagram/
├── src/
│   ├── renderer/
│   │   └── OrbitalDiagram.ts    # Classe principal de renderização
│   └── main.ts                  # Ponto de entrada da aplicação
├── examples/
│   └── metadata-system.json     # Exemplo de configuração
├── index.html                   # Interface web
├── vite.config.ts              # Configuração do Vite
└── tsconfig.json               # Configuração do TypeScript
```

## Extensão VS Code (Em Desenvolvimento)

Uma extensão VS Code está em desenvolvimento para permitir:
- Preview em tempo real do diagrama
- Validação do JSON
- Snippets para componentes comuns
- Exportação direta para SVG/PNG

## Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Crie um Pull Request

## Licença

MIT
