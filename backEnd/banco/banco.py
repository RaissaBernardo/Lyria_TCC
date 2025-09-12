import sqlite3
from datetime import datetime
import os

DB_NOME = os.path.join(os.path.dirname(__file__), "lyria.db")

def criar_banco():
    conn = sqlite3.connect(DB_NOME, timeout=10, check_same_thread=False)
    cursor = conn.cursor()
    cursor.execute("PRAGMA journal_mode=WAL;")
    cursor.execute("PRAGMA synchronous=NORMAL;")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        senha_hash TEXT,
        persona_escolhida TEXT,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ultimo_acesso TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS conversas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        titulo TEXT,
        iniciado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status TEXT,
        FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
    );
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        conversa_id INTEGER NOT NULL,
        conteudo TEXT NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(usuario_id) REFERENCES usuarios(id),
        FOREIGN KEY(conversa_id) REFERENCES conversas(id)
    );
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ai_responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_id INTEGER NOT NULL,
        conteudo TEXT NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        modelo_usado TEXT,
        tokens INTEGER,
        FOREIGN KEY(request_id) REFERENCES user_requests(id)
    );    
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS mensagens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversa_id INTEGER NOT NULL,
        request_id INTEGER NOT NULL,
        response_id INTEGER NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(conversa_id) REFERENCES conversas(id),
        FOREIGN KEY(request_id) REFERENCES user_requests(id),
        FOREIGN KEY(response_id) REFERENCES ai_responses(id)
    );
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS memorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        chave TEXT NOT NULL,
        valor TEXT NOT NULL,
        tipo TEXT,
        relevancia INTEGER DEFAULT 0,
        conversa_origem INTEGER,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expira_em TIMESTAMP,
        FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
    );
    """)
    
    # Adiciona a coluna 'titulo' se ela não existir na tabela 'conversas'
    cursor.execute("PRAGMA table_info(conversas)")
    colunas_conversas = [info[1] for info in cursor.fetchall()]
    if 'titulo' not in colunas_conversas:
        cursor.execute("ALTER TABLE conversas ADD COLUMN titulo TEXT;")

    # Adiciona a coluna 'foto_perfil_url' se ela não existir na tabela 'usuarios'
    cursor.execute("PRAGMA table_info(usuarios)")
    colunas_usuarios = [info[1] for info in cursor.fetchall()]
    if 'foto_perfil_url' not in colunas_usuarios:
        cursor.execute("ALTER TABLE usuarios ADD COLUMN foto_perfil_url TEXT;")

    conn.commit()
    conn.close()

def carregar_memorias(usuario, limite=20):
    conn = sqlite3.connect(DB_NOME, timeout=10, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("""
        SELECT ur.conteudo AS usuario_disse,
               ar.conteudo AS ia_respondeu,
               m.criado_em AS quando
        FROM mensagens m
        JOIN user_requests ur ON m.request_id = ur.id
        JOIN ai_responses ar ON m.response_id = ar.id
        JOIN conversas c ON m.conversa_id = c.id
        JOIN usuarios u ON c.usuario_id = u.id
        WHERE u.nome = ?
        ORDER BY m.criado_em DESC
        LIMIT ?
    """, (usuario, limite))
    results = cursor.fetchall()
    conn.close()
    memorias = []
    for row in results:
        memorias.append(f"Usuário: {row['usuario_disse']}")
        memorias.append(f"IA: {row['ia_respondeu']}")
    return list(reversed(memorias))

def pegarPersonaEscolhida(usuario):
    conn = sqlite3.connect(DB_NOME, timeout=10, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT persona_escolhida FROM usuarios WHERE nome = ?", (usuario,))
    result = cursor.fetchone()
    conn.close()
    return result["persona_escolhida"] if result else None

def escolherApersona(persona, usuario):
    conn = sqlite3.connect(DB_NOME, timeout=10, check_same_thread=False)
    cursor = conn.cursor()
    cursor.execute("UPDATE usuarios SET persona_escolhida = ? WHERE nome = ?", (persona, usuario))
    conn.commit()
    conn.close()

def criarUsuario(nome, email, persona, senha_hash=None):
    conn = sqlite3.connect(DB_NOME, timeout=10, check_same_thread=False)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO usuarios (nome, email, persona_escolhida, senha_hash, criado_em, ultimo_acesso)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (nome, email, persona, senha_hash, datetime.now(), datetime.now()))
    conn.commit()
    usuario_id = cursor.lastrowid
    conn.close()
    return usuario_id

def procurarUsuarioPorEmail(usuarioEmail):
    conn = sqlite3.connect(DB_NOME, timeout=10, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM usuarios WHERE email = ?", (usuarioEmail,))
    result = cursor.fetchone()
    conn.close()
    return dict(result) if result else None

def get_usuario_por_id(usuario_id):
    conn = sqlite3.connect(DB_NOME, timeout=10, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT id, nome, email, foto_perfil_url, persona_escolhida FROM usuarios WHERE id = ?", (usuario_id,))
    result = cursor.fetchone()
    conn.close()
    return dict(result) if result else None

def atualizar_perfil_usuario(usuario_id, nome=None, email=None, senha_hash=None, foto_perfil_url=None):
    conn = sqlite3.connect(DB_NOME, timeout=10, check_same_thread=False)
    cursor = conn.cursor()

    fields_to_update = []
    params = []

    if nome:
        fields_to_update.append("nome = ?")
        params.append(nome)
    if email:
        fields_to_update.append("email = ?")
        params.append(email)
    if senha_hash:
        fields_to_update.append("senha_hash = ?")
        params.append(senha_hash)
    if foto_perfil_url:
        fields_to_update.append("foto_perfil_url = ?")
        params.append(foto_perfil_url)

    if not fields_to_update:
        return  # No fields to update

    params.append(usuario_id)

    query = f"UPDATE usuarios SET {', '.join(fields_to_update)} WHERE id = ?"

    try:
        cursor.execute(query, tuple(params))
        conn.commit()
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

def pegarHistorico(usuario, limite=3):
    conn = sqlite3.connect(DB_NOME, timeout=10, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("""
        SELECT ur.conteudo AS pergunta,
               ar.conteudo AS resposta,
               m.criado_em AS timestamp
        FROM mensagens m
        JOIN user_requests ur ON m.request_id = ur.id
        JOIN ai_responses ar ON m.response_id = ar.id
        JOIN conversas c ON m.conversa_id = c.id
        JOIN usuarios u ON c.usuario_id = u.id
        WHERE u.nome = ?
        ORDER BY m.criado_em DESC
        LIMIT ?
    """, (usuario, limite))
    results = cursor.fetchall()
    conn.close()
    return [dict(row) for row in results]

def carregar_conversas(usuario, limite=12):
    conn = sqlite3.connect(DB_NOME, timeout=10, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("""
        SELECT ur.conteudo AS pergunta, ar.conteudo AS resposta
        FROM mensagens m
        JOIN user_requests ur ON m.request_id = ur.id
        JOIN ai_responses ar ON m.response_id = ar.id
        JOIN conversas c ON m.conversa_id = c.id
        JOIN usuarios u ON c.usuario_id = u.id
        WHERE u.nome = ?
        ORDER BY m.criado_em ASC
        LIMIT ?
    """, (usuario, limite))
    results = cursor.fetchall()
    conn.close()
    return [{"pergunta": row["pergunta"], "resposta": row["resposta"]} for row in results]

def salvarMensagem(usuario, conversa_id, pergunta, resposta, modelo_usado=None, tokens=None):
    conn = sqlite3.connect(DB_NOME, timeout=10, check_same_thread=False)
    cursor = conn.cursor()

    try:
        # Etapa 1: Obter o ID do usuário de forma segura
        cursor.execute("SELECT id FROM usuarios WHERE nome = ?", (usuario,))
        user_row = cursor.fetchone()
        if not user_row:
            raise ValueError(f"Usuário '{usuario}' não encontrado ao tentar salvar mensagem.")
        usuario_id = user_row[0]

        # Etapa 2: Atualizar a conversa e inserir as novas mensagens
        cursor.execute("UPDATE conversas SET atualizado_em = ? WHERE id = ?", (datetime.now(), conversa_id))

        cursor.execute(
            "INSERT INTO user_requests (usuario_id, conversa_id, conteudo) VALUES (?, ?, ?)",
            (usuario_id, conversa_id, pergunta)
        )
        request_id = cursor.lastrowid

        cursor.execute(
            "INSERT INTO ai_responses (request_id, conteudo, modelo_usado, tokens) VALUES (?, ?, ?, ?)",
            (request_id, resposta, modelo_usado, tokens)
        )
        response_id = cursor.lastrowid

        cursor.execute(
            "INSERT INTO mensagens (conversa_id, request_id, response_id) VALUES (?, ?, ?)",
            (conversa_id, request_id, response_id)
        )

        # Etapa 3: Inserir nas memórias usando o usuario_id já obtido
        cursor.execute(
            "INSERT INTO memorias (usuario_id, chave, valor, tipo, conversa_origem) VALUES (?, ?, ?, 'conversa', ?)",
            (usuario_id, f"pergunta_{request_id}", pergunta, conversa_id)
        )
        cursor.execute(
            "INSERT INTO memorias (usuario_id, chave, valor, tipo, conversa_origem) VALUES (?, ?, ?, 'conversa', ?)",
            (usuario_id, f"resposta_{response_id}", resposta, conversa_id)
        )

        conn.commit()

    except Exception as e:
        conn.rollback()
        print(f"Erro em salvarMensagem: {e}")
        raise
    finally:
        conn.close()

def criar_nova_conversa(usuario_id, titulo="Nova Conversa"):
    conn = sqlite3.connect(DB_NOME, timeout=10, check_same_thread=False)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO conversas (usuario_id, titulo, iniciado_em, atualizado_em)
        VALUES (?, ?, ?, ?)
    """, (usuario_id, titulo, datetime.now(), datetime.now()))
    conn.commit()
    conversa_id = cursor.lastrowid
    conn.close()
    return conversa_id

def listar_conversas_por_usuario(usuario_id):
    conn = sqlite3.connect(DB_NOME, timeout=10, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, titulo, atualizado_em FROM conversas
        WHERE usuario_id = ?
        ORDER BY atualizado_em DESC
    """, (usuario_id,))
    results = cursor.fetchall()
    conn.close()
    return [dict(row) for row in results]

def carregar_mensagens_da_conversa(conversa_id):
    conn = sqlite3.connect(DB_NOME, timeout=10, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    # Esta query junta as tabelas de requests e responses para reconstruir a conversa
    cursor.execute("""
        SELECT
            ur.conteudo as pergunta,
            ar.conteudo as resposta,
            m.criado_em as timestamp
        FROM mensagens m
        JOIN user_requests ur ON m.request_id = ur.id
        JOIN ai_responses ar ON m.response_id = ar.id
        WHERE m.conversa_id = ?
        ORDER BY m.criado_em ASC
    """, (conversa_id,))
    results = cursor.fetchall()
    conn.close()
    # Formata a saída para ser uma lista de pares pergunta/resposta
    mensagens = []
    for row in results:
        mensagens.append({"sender": "user", "text": row["pergunta"], "timestamp": row["timestamp"]})
        mensagens.append({"sender": "bot", "text": row["resposta"], "timestamp": row["timestamp"]})
    return mensagens

def deletar_conversa(conversa_id):
    conn = sqlite3.connect(DB_NOME, timeout=10, check_same_thread=False)
    cursor = conn.cursor()
    # Deletar em cascata não é padrão no sqlite, então deletamos de cada tabela
    cursor.execute("DELETE FROM mensagens WHERE conversa_id = ?", (conversa_id,))
    cursor.execute("DELETE FROM user_requests WHERE conversa_id = ?", (conversa_id,))
    # Ai_responses são deletadas em cascata a partir de user_requests se o foreign key for configurado para isso
    # mas vamos garantir.
    cursor.execute("""
        DELETE FROM ai_responses WHERE request_id IN (SELECT id FROM user_requests WHERE conversa_id = ?)
    """, (conversa_id,))
    cursor.execute("DELETE FROM conversas WHERE id = ?", (conversa_id,))
    conn.commit()
    conn.close()
