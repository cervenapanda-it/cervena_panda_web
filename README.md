# Červená panda — web

Statický web přípravných kurzů Červená panda (HTML / CSS / JavaScript).

## Struktura

```
index.html                 Domovská stránka (hero, bloky, reference, poptávkový formulář)
jak-ucime.html             Jak učíme
tipy-na-prijimacky.html    Tipy, jak na přijímačky
caste-dotazy.html          Časté dotazy
ucitele.html               Učitelé
assets/css/styles.css      Sdílené styly
assets/js/script.js        Navigace, FAQ accordion, poptávkový formulář, animace
assets/img/                Obrázky a logo
assets/docs/               Právní dokumenty (VOP, GDPR) — linkované z patičky a formuláře
```

## Lokální spuštění

```bash
python3 -m http.server 8000
# otevři http://localhost:8000
```

## Poptávkový formulář

Formulář na domovské stránce odesílá data (POST JSON) na n8n webhook
`https://n8n-production-9b68.up.railway.app/webhook/poptavka`.
