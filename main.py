from fastapi import FastAPI
from pydantic import BaseModel
import pymysql
from datetime import date
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def home():
    return FileResponse("static/index.html")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # libera para qualquer frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------
# MODELS PARA POST/PUT
# ------------------------
class ListaIn(BaseModel):
    nome: str

class ItemIn(BaseModel):
    descricao: str
    detalhes: str = None
    categoria: str = None

# ------------------------
# CONFIGURAÇÃO DE CONEXÃO COM O MYSQL
# ------------------------
def get_connection():
    return pymysql.connect(
        host="localhost",
        user="userrp",
        password="snhrp",
        database="lista_compra_online",
        charset='utf8',
        cursorclass=pymysql.cursors.DictCursor
    )

# ------------------------
# ROTAS PARA LISTAS
# ------------------------
@app.get("/listas")
def listar_listas():
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM lista")
            listas = cursor.fetchall()
    finally:
        conn.close()
    return listas

@app.post("/listas")
def criar_lista(lista: ListaIn):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = "INSERT INTO lista (nome, cadastro) VALUES (%s, %s)"
            cursor.execute(sql, (lista.nome, date.today()))
            conn.commit()
            new_id = cursor.lastrowid
    finally:
        conn.close()
    return {"id": new_id, "nome": lista.nome}

@app.put("/listas/{lista_id}")
def editar_lista(lista_id: int, lista: ListaIn):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = "UPDATE lista SET nome = %s WHERE id = %s"
            cursor.execute(sql, (lista.nome, lista_id))
            conn.commit()
    finally:
        conn.close()
    return {"id": lista_id, "nome": lista.nome}

@app.delete("/listas/{lista_id}")
def excluir_lista(lista_id: int):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = "DELETE FROM lista WHERE id = %s"
            cursor.execute(sql, (lista_id,))
            conn.commit()
    finally:
        conn.close()
    return {"status": "ok", "mensagem": f"Lista {lista_id} excluída com sucesso"}

# ------------------------
# ROTAS PARA ITENS
# ------------------------
@app.get("/listas/{lista_id}/itens")
def listar_itens(lista_id: int):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM item_lista WHERE cod_lista = %s ORDER BY categoria, cod_item", (lista_id,))
            itens = cursor.fetchall()
    finally:
        conn.close()
    return itens

@app.post("/listas/{lista_id}/itens")
def adicionar_item(lista_id: int, item: ItemIn):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = """
            INSERT INTO item_lista (cod_lista, descricao, detalhes, categoria) 
            VALUES (%s, %s, %s, %s)
            """
            cursor.execute(sql, (lista_id, item.descricao, item.detalhes, item.categoria))
            conn.commit()
            new_id = cursor.lastrowid
    finally:
        conn.close()
    return {
        "cod_item": new_id,
        "descricao": item.descricao,
        "detalhes": item.detalhes,
        "categoria": item.categoria
    }

@app.put("/itens/{item_id}")
def editar_item(item_id: int, item: ItemIn):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = """
            UPDATE item_lista 
            SET descricao = %s, detalhes = %s, categoria = %s 
            WHERE cod_item = %s
            """
            cursor.execute(sql, (item.descricao, item.detalhes, item.categoria, item_id))
            conn.commit()
    finally:
        conn.close()
    return {
        "cod_item": item_id,
        "descricao": item.descricao,
        "detalhes": item.detalhes,
        "categoria": item.categoria
    }

@app.delete("/itens/{item_id}")
def excluir_item(item_id: int):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = "DELETE FROM item_lista WHERE cod_item = %s"
            cursor.execute(sql, (item_id,))
            conn.commit()
    finally:
        conn.close()
    return {"status": "ok", "mensagem": f"Item {item_id} excluído com sucesso"}

# SERVIR FRONTEND
app.mount("/", StaticFiles(directory="static", html=True), name="static")