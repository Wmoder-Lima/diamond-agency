# Protocolo dos agentes com o painel

Cole o bloco abaixo no `CLAUDE.md` de cada projeto (aba Code) e, nas skills de diretoria, na seção de regras. Troque `CAMINHO` pelo caminho real da pasta `bridge` no seu computador.

```
## Registro no painel (obrigatório)

Todo trabalho é registrado no painel com o comando:
  node CAMINHO/bridge/empresa.mjs <comando>

1. Ao receber uma demanda, crie a tarefa e marque como em andamento:
   node CAMINHO/bridge/empresa.mjs task new "Título claro" --agent <id> --dept <setor> --by <quem pediu> --priority media
   node CAMINHO/bridge/empresa.mjs task set <id-da-tarefa> doing --agent <id>

2. Ao passar trabalho para outro agente, registre a conversa:
   node CAMINHO/bridge/empresa.mjs say "O que você precisa que ele faça" --from <id> --to <id> --task <id-da-tarefa>

3. ANTES de qualquer ação irreversível (gastar dinheiro, enviar mensagem a cliente, publicar,
   mexer em produção, enviar contrato), peça aprovação e PARE até ser aprovado:
   node CAMINHO/bridge/empresa.mjs approve request "Ação em uma frase" --agent <id> --task <id-da-tarefa> --details "contexto"
   node CAMINHO/bridge/empresa.mjs approve status <id-do-pedido>
   Só prossiga se o status for "approved". Se for "rejected", leia decision_note e ajuste.

4. Ao terminar, registre o resultado:
   node CAMINHO/bridge/empresa.mjs task set <id-da-tarefa> done --result "Resumo do que foi entregue" --agent <id>

5. Quando aprender algo que vale lembrar (preferência de cliente, decisão, o que funcionou):
   node CAMINHO/bridge/empresa.mjs memory add "Título" "Conteúdo" --cat <categoria> --tags a,b --agent <id>
   Antes de começar tarefas parecidas, consulte:
   node CAMINHO/bridge/empresa.mjs memory search "termo"

6. Resultados numéricos para os gráficos:
   node CAMINHO/bridge/empresa.mjs metric add <nome> <valor> --dept <setor> --unit <un>
```

IDs dos agentes: beatriz, helena, rafael, camila, thiago, bruno, larissa, diego, marcela, lucas, paula, renato, gustavo, nina, felipe, juliana, marcos, isabela.
Status de tarefa: todo, doing, blocked, review, done, cancelled.
Categorias de memória sugeridas: marca, cliente, processo, decisao, aprendizado.
