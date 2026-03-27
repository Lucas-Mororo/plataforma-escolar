"""
Script para popular o banco de dados com dados de exemplo.

Uso:
    python seed.py

Cria:
    - 1 admin (superuser)
    - 8 turmas
    - 5 professores
    - 20 alunos
    - 15 atividades
    - ~40 respostas (algumas com nota e feedback)
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.utils import timezone
from django.db import connection
from datetime import timedelta
import random

from accounts.models import User
from turmas.models import Turma
from atividades.models import Atividade
from respostas.models import Resposta

print("Limpando dados anteriores...")
Resposta.objects.all().delete()
Atividade.objects.all().delete()
User.objects.filter(is_superuser=False).delete()
Turma.objects.all().delete()

# ============================================================
# TURMAS
# ============================================================
print("Criando turmas...")
nomes_turmas = [
    "1 Ano A", "1 Ano B", "2 Ano A", "2 Ano B",
    "3 Ano A", "3 Ano B", "4 Ano A", "4 Ano B",
]
turmas = [Turma.objects.create(nome=n) for n in nomes_turmas]
print(f"  {len(turmas)} turmas criadas")

# ============================================================
# ADMIN
# ============================================================
if not User.objects.filter(is_superuser=True).exists():
    print("Criando admin...")
    admin = User.objects.create_superuser(
        username="admin", email="admin@escola.com", password="admin123", role="PROFESSOR"
    )
    print("  Admin criado: admin@escola.com / admin123")
else:
    admin = User.objects.filter(is_superuser=True).first()
    print(f"  Admin ja existe: {admin.email}")

# ============================================================
# PROFESSORES
# ============================================================
print("Criando professores...")
professores_data = [
    ("prof.silva", "silva@escola.com"),
    ("prof.santos", "santos@escola.com"),
    ("prof.oliveira", "oliveira@escola.com"),
    ("prof.costa", "costa@escola.com"),
    ("prof.pereira", "pereira@escola.com"),
]
professores = []
for name, email in professores_data:
    p = User(username=name, email=email, role="PROFESSOR", is_active=True)
    p.set_password("senha123")
    p.save()
    professores.append(p)
print(f"  {len(professores)} professores criados")

# ============================================================
# ALUNOS
# ============================================================
print("Criando alunos...")
alunos_data = [
    ("ana.souza", "ana.souza@escola.com"),
    ("bruno.lima", "bruno.lima@escola.com"),
    ("carla.dias", "carla.dias@escola.com"),
    ("daniel.rocha", "daniel.rocha@escola.com"),
    ("elena.martins", "elena.martins@escola.com"),
    ("felipe.alves", "felipe.alves@escola.com"),
    ("gabriela.costa", "gabriela.costa@escola.com"),
    ("henrique.santos", "henrique.santos@escola.com"),
    ("isabela.ferreira", "isabela.ferreira@escola.com"),
    ("joao.oliveira", "joao.oliveira@escola.com"),
    ("karen.silva", "karen.silva@escola.com"),
    ("lucas.pereira", "lucas.pereira@escola.com"),
    ("mariana.gomes", "mariana.gomes@escola.com"),
    ("nicolas.ribeiro", "nicolas.ribeiro@escola.com"),
    ("patricia.araujo", "patricia.araujo@escola.com"),
    ("rafael.mendes", "rafael.mendes@escola.com"),
    ("sabrina.castro", "sabrina.castro@escola.com"),
    ("thiago.barbosa", "thiago.barbosa@escola.com"),
    ("vanessa.cardoso", "vanessa.cardoso@escola.com"),
    ("william.nunes", "william.nunes@escola.com"),
]
alunos = []
for i, (name, email) in enumerate(alunos_data):
    a = User(username=name, email=email, role="ALUNO", is_active=True)
    a.set_password("senha123")
    a.save()
    t = [turmas[i % len(turmas)]]
    if random.random() > 0.6:
        t.append(random.choice([x for x in turmas if x not in t]))
    a.turma.set(t)
    alunos.append(a)

for i, name in enumerate(["novo.aluno1", "novo.aluno2"]):
    u = User(username=name, email=f"{name}@escola.com", role="ALUNO", is_active=False)
    u.set_password("senha123")
    u.save()
    u.turma.set([random.choice(turmas)])

u = User(username="prof.novo", email="prof.novo@escola.com", role="PROFESSOR", is_active=False)
u.set_password("senha123")
u.save()

print(f"  {len(alunos)} alunos ativos + 2 inativos criados")

# ============================================================
# ATIVIDADES
# ============================================================
print("Criando atividades...")
dados_atividades = [
    ("Interpretacao de Texto - Conto Brasileiro", "Leia o conto 'A Cartomante' de Machado de Assis e responda as questoes sobre o enredo, personagens e temas abordados.", 7),
    ("Equacoes do Segundo Grau", "Resolva as 10 equacoes do segundo grau utilizando a formula de Bhaskara. Mostre todos os calculos.", 5),
    ("Revolucao Industrial - Dissertacao", "Escreva uma dissertacao de 20 a 30 linhas sobre os impactos da Revolucao Industrial na sociedade europeia.", 10),
    ("Tabela Periodica - Elementos", "Classifique os 20 primeiros elementos da tabela periodica quanto a familia, periodo e tipo.", 3),
    ("Redacao - Meio Ambiente", "Produza uma redacao dissertativa-argumentativa sobre preservacao ambiental no Brasil. Minimo 25 linhas.", 14),
    ("Geometria - Areas e Perimetros", "Calcule a area e o perimetro das figuras geometricas apresentadas.", 4),
    ("Guerra Fria - Questionario", "Responda as 15 questoes sobre a Guerra Fria.", 6),
    ("Ecossistemas Brasileiros", "Descreva as principais caracteristicas de 5 ecossistemas brasileiros.", 8),
    ("Ingles - Text Comprehension", "Read the text about climate change and answer the 10 questions in English.", 5),
    ("Funcoes Matematicas - Graficos", "Construa os graficos das funcoes do primeiro e segundo grau apresentadas.", 7),
    ("Literatura - Romantismo Brasileiro", "Analise os poemas de Goncalves Dias e Alvares de Azevedo.", -3),
    ("Fisica - Leis de Newton", "Resolva os 8 exercicios sobre as tres Leis de Newton.", -5),
    ("Projeto de Pesquisa - Tema Livre", "Elabore um projeto de pesquisa com introducao, justificativa, objetivos e metodologia.", 21),
    ("Probabilidade e Estatistica", "Resolva os problemas de probabilidade e calcule media, mediana e moda.", -1),
    ("Filosofia - Etica e Moral", "Escreva um texto reflexivo sobre a diferenca entre etica e moral.", 12),
]

atividades = []
for i, (titulo, desc, dias) in enumerate(dados_atividades):
    atv = Atividade.objects.create(
        titulo=titulo,
        descricao=desc,
        professor=professores[i % len(professores)],
        data_entrega=timezone.now() + timedelta(days=dias),
    )
    atv.turma.set(random.sample(turmas, k=random.randint(1, 3)))
    atividades.append(atv)
print(f"  {len(atividades)} atividades criadas")

# ============================================================
# RESPOSTAS (inseridas direto no banco, sem clean())
# ============================================================
print("Criando respostas...")

textos = [
    "A Cartomante de Machado de Assis apresenta uma critica a credulidade humana. O protagonista Camilo busca respostas em uma cartomante.",
    "Utilizando a formula de Bhaskara: x = (-b +/- sqrt(b2 - 4ac)) / 2a. Para a primeira equacao: delta = 9, x1 = 1, x2 = 4.",
    "A Revolucao Industrial transformou profundamente a sociedade europeia com o exodo rural e a urbanizacao acelerada.",
    "Hidrogenio (nao-metal, periodo 1), Helio (gas nobre, periodo 1), Litio (metal alcalino, periodo 2).",
    "A preservacao ambiental no Brasil enfrenta desafios como o desmatamento e a falta de politicas publicas efetivas.",
    "Area do triangulo: A = (b x h) / 2 = 12 cm2. Perimetro: P = 6 + 5 + 5 = 16 cm.",
    "A Guerra Fria foi um periodo de tensao entre EUA e URSS que durou de 1947 a 1991.",
    "A Amazonia e o maior bioma brasileiro, com clima equatorial e grande biodiversidade.",
    "Climate change is one of the most pressing issues. The text highlights the importance of reducing carbon emissions.",
    "A funcao f(x) = 2x + 3 tem coeficiente angular 2 e raiz x = -3/2.",
    "Goncalves Dias apresenta o saudosismo em 'Cancao do Exilio'. Alvares de Azevedo explora o mal do seculo.",
    "Pela Segunda Lei de Newton: F = m.a. Para 5kg com 2m/s2, F = 10N.",
    "Meu projeto aborda o impacto das redes sociais na saude mental dos adolescentes.",
    "A probabilidade de numero par em um dado e 3/6 = 50%. Media de {2,4,6,8,10} = 6.",
    "Etica e moral sao conceitos distintos. A moral refere-se aos costumes, a etica e a reflexao filosofica.",
]

feedbacks = [
    "Otimo trabalho! Analise bem fundamentada.",
    "Boa resposta, mas poderia aprofundar mais.",
    "Calculos corretos. Parabens pela organizacao.",
    "Faltou mencionar alguns elementos importantes.",
    "Excelente dissertacao! Argumentos bem estruturados.",
    "Resposta satisfatoria, revise a formatacao.",
    "Muito bom! Continue assim.",
    "Precisa melhorar a fundamentacao teorica.",
    "Resposta completa e bem elaborada.",
    "Bom trabalho, atencao aos detalhes.",
]

count = 0
now = timezone.now()

for atv in atividades:
    turmas_atv = set(atv.turma.all())
    elegiveis = [a for a in alunos if set(a.turma.all()) & turmas_atv]
    qtd = max(1, int(len(elegiveis) * random.uniform(0.5, 0.9)))
    respondentes = random.sample(elegiveis, k=min(qtd, len(elegiveis)))

    for aluno in respondentes:
        texto = random.choice(textos)

        # Insere direto via SQL para bypassar clean() que valida data_entrega
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO respostas_resposta (atividade_id, aluno_id, texto, nota, feedback, created_at, updated_at) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                [atv.id, aluno.id, texto, None, None, now, now]
            )
            resp_id = cursor.lastrowid

        # Corrigir 60% das respostas
        if random.random() < 0.6:
            nota = round(random.uniform(4.0, 10.0), 1)
            fb = random.choice(feedbacks) if random.random() < 0.7 else None
            Resposta.objects.filter(id=resp_id).update(nota=nota, feedback=fb)

        count += 1

print(f"  {count} respostas criadas")

# ============================================================
# RESUMO
# ============================================================
print("\n" + "=" * 50)
print("SEED CONCLUIDO!")
print("=" * 50)
print(f"  Turmas:      {len(turmas)}")
print(f"  Professores: {len(professores)} ativos + 1 inativo")
print(f"  Alunos:      {len(alunos)} ativos + 2 inativos")
print(f"  Atividades:  {len(atividades)}")
print(f"  Respostas:   {count}")
print(f"\nCredenciais:")
print(f"  admin@escola.com       -> admin123  (superuser/admin)")
print(f"  silva@escola.com       -> senha123  (professor)")
print(f"  ana.souza@escola.com   -> senha123  (aluno)")
print(f"  Todos usam senha: senha123")
print("=" * 50)
