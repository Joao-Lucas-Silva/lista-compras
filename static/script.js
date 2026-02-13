let listaAtivaId = null;

// ----------------------
// LOADING
// ----------------------
function showLoading() {
    document.getElementById("loading").classList.remove("hidden");
}

function hideLoading() {
    document.getElementById("loading").classList.add("hidden");
}

// ----------------------
// TELAS
// ----------------------
function abrirTelaItens(id, nome) {
    listaAtivaId = id;
    document.getElementById("listaSelecionada").textContent = nome;
    document.getElementById("tela-listas").classList.add("hidden");
    document.getElementById("tela-itens").classList.remove("hidden");
    document.getElementById("tela-listas").style.display = "none";
    document.getElementById("tela-itens").style.display = "block";
    getItens();
}

function voltarParaListas() {
    document.getElementById("tela-listas").classList.remove("hidden");
    document.getElementById("tela-itens").classList.add("hidden");
    document.getElementById("tela-itens").style.display = "none";
    document.getElementById("tela-listas").style.display = "block";
    getListas();
}

// ----------------------
// LISTAS
// ----------------------
function getListas() {
    showLoading();
    fetch("https://unrewarding-elliptical-cruz.ngrok-free.dev/listas")
    .then(res => res.json())
    .then(listas => {
        const container = document.getElementById("listas");
        container.innerHTML = "";

        listas.forEach(lista => {
            const card = document.createElement("div");
            card.className = "lista-card";

            const titulo = document.createElement("span");
            titulo.textContent = lista.nome;
            card.appendChild(titulo);

            const botoes = document.createElement("div");

            const btnEditar = document.createElement("button");
            btnEditar.textContent = "Editar";
            btnEditar.onclick = (e) => {
                e.stopPropagation();
                const novoNome = prompt("Digite o novo nome:", lista.nome);
                if (novoNome) editarLista(lista.id, novoNome);
            };
            botoes.appendChild(btnEditar);

            const btnDel = document.createElement("button");
            btnDel.textContent = "Excluir";
            btnDel.className = "btn-del";
            btnDel.onclick = (e) => {
                e.stopPropagation();
                if (confirm(`Deseja excluir a lista "${lista.nome}"?`)) excluirLista(lista.id);
            };
            botoes.appendChild(btnDel);

            card.appendChild(botoes);
            card.onclick = () => abrirTelaItens(lista.id, lista.nome);
            container.appendChild(card);
        });
    })
    .finally(() => hideLoading());
}

function criarLista() {
    const nome = document.getElementById("nomeLista").value;
    if (!nome) return alert("Digite o nome da lista");

    showLoading();
    fetch("https://unrewarding-elliptical-cruz.ngrok-free.dev/listas", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({nome})
    })
    .then(res => res.json())
    .then(() => {
        document.getElementById("nomeLista").value = "";
        getListas();
    })
    .finally(() => hideLoading());
}

function editarLista(id, novoNome) {
    showLoading();
    fetch(`https://unrewarding-elliptical-cruz.ngrok-free.dev/listas/${id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({nome: novoNome})
    }).then(() => getListas())
    .finally(() => hideLoading());
}

function excluirLista(id) {
    showLoading();
    fetch(`https://unrewarding-elliptical-cruz.ngrok-free.dev/listas/${id}`, {method: "DELETE"})
    .then(() => getListas())
    .finally(() => hideLoading());
}

// ----------------------
// ITENS
// ----------------------
function getItens() {
    if (!listaAtivaId) return;

    showLoading();
    fetch(`https://unrewarding-elliptical-cruz.ngrok-free.dev/listas/${listaAtivaId}/itens`)
    .then(res => res.json())
    .then(itens => {
        const ul = document.getElementById("itens");
        ul.innerHTML = "";

        itens.forEach(i => {
            const li = document.createElement("li");
            li.className = i.categoria ? `categoria-${i.categoria.replace(/\s+/g, '-').toLowerCase()}` : '';

            const inputDesc = document.createElement("input");
            inputDesc.value = i.descricao;
            li.appendChild(inputDesc);

            const inputDet = document.createElement("input");
            inputDet.value = i.detalhes || "";
            li.appendChild(inputDet);

            const selectCat = document.createElement("select");
            ["","horti-fruti","frios","laticinios","bebidas","outros"].forEach(cat => {
                const opt = document.createElement("option");
                opt.value = cat;
                opt.textContent = cat || "Selecione";
                if (i.categoria === cat) opt.selected = true;
                selectCat.appendChild(opt);
            });
            li.appendChild(selectCat);

            const btnSalvar = document.createElement("button");
            btnSalvar.textContent = "Salvar";
            btnSalvar.onclick = () => atualizarItem(i.cod_item, inputDesc.value, inputDet.value, selectCat.value);
            li.appendChild(btnSalvar);

            const btnDel = document.createElement("button");
            btnDel.textContent = "Excluir";
            btnDel.className = "btn-del";
            btnDel.onclick = () => {
                if (confirm(`Deseja excluir o item "${i.descricao}"?`)) excluirItem(i.cod_item);
            };
            li.appendChild(btnDel);

            ul.appendChild(li);
        });
    })
    .finally(() => hideLoading());
}

function adicionarItem() {
    const desc = document.getElementById("descricaoItem").value;
    const det = document.getElementById("detalhesItem").value;
    const cat = document.getElementById("categoriaItem").value;

    if (!listaAtivaId) return alert("Selecione uma lista");
    if (!desc) return alert("Digite a descrição");

    showLoading();
    fetch(`https://unrewarding-elliptical-cruz.ngrok-free.dev/listas/${listaAtivaId}/itens`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({descricao: desc, detalhes: det, categoria: cat})
    })
    .then(res => res.json())
    .then(() => {
        document.getElementById("descricaoItem").value = "";
        document.getElementById("detalhesItem").value = "";
        document.getElementById("categoriaItem").value = "";
        getItens();
        getListas();
    })
    .finally(() => hideLoading());
}

function atualizarItem(id, desc, det, cat) {
    showLoading();
    fetch(`https://unrewarding-elliptical-cruz.ngrok-free.dev/itens/${id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({descricao: desc, detalhes: det, categoria: cat})
    })
    .then(() => {
        getItens();
        getListas();
    })
    .finally(() => hideLoading());
}

function excluirItem(id) {
    showLoading();
    fetch(`https://unrewarding-elliptical-cruz.ngrok-free.dev/itens/${id}`, {method: "DELETE"})
    .then(() => {
        getItens();
        getListas();
    })
    .finally(() => hideLoading());
}

// Inicializa
getListas();
