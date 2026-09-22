# AI mit Arnie · Model Lab

Lokale App für funktionierende Higgsfield-Bild- und Videovergleiche. Node.js 24+, natives JavaScript und CSS. Keine Paketinstallation, kein Build, kein Hosting.

## Einrichtung und Start

Voraussetzungen: Node.js 24 oder neuer, ein eigener Higgsfield-API-Key im Format `KEY_ID:KEY_SECRET` und Guthaben für Generierungen. Die App läuft lokal auf Windows, macOS oder Linux. GitHub stellt den Quellcode bereit; GitHub Pages kann das benötigte Node-Backend nicht ausführen.

```sh
git clone https://github.com/Arnie936/ai-mit-arnie-model-lab.git
cd ai-mit-arnie-model-lab
```

`.env.example` nach `.env` kopieren:

```powershell
# Windows PowerShell
Copy-Item .env.example .env
```

```sh
# macOS / Linux
cp .env.example .env
```

Den eigenen Schlüssel in `.env` eintragen:

```dotenv
HF_CREDENTIALS=KEY_ID:KEY_SECRET
PORT=3210
MAX_SPEND_USD=1
```

Dann starten, ohne Paketinstallation oder Build:

```sh
npm start
```

Öffnen: http://127.0.0.1:3210. Alternativ `node server.mjs`. Stoppen mit Strg+C im Terminal. Ist der Port belegt, `PORT` in `.env` ändern und die entsprechende URL öffnen.

`HIGGSFIELD_API_KEY` und `HF_KEY` werden als Alias unterstützt. `HF_CREDENTIALS` hat Vorrang. Der Schlüssel bleibt im Backend. `.env`, lokale Ergebnisse, Uploads, Logs, Backups und persönliche Prüfberichte werden nicht von Git erfasst.

Neue Installationen starten mit leerem Verlauf. Eigene Ergebnisse liegen in `data/media/`, Referenzen in `data/uploads/` und der Verlauf in `data/state.json`. Vor einem Umzug oder einer Neuinstallation den gesamten Ordner `data/` lokal sichern. Backups mit `.env` enthalten deinen Schlüssel und dürfen nicht veröffentlicht werden.

## Aktuelle Modellauswahl

Die Adapter wurden am 22.09.2026 anhand der [offiziellen API-Preisliste](https://open.higgsfield.ai/pricing?tab=all) und Modell-Dokumentation geprüft. Es gibt sechs Hauptkarten pro Tab und insgesamt 17 auswählbare Adapter. Verfügbarkeit und Preise hängen vom eigenen Account und vom Anbieter ab. Seedance 2.5 liefert statt einer numerischen Konto-Schätzung einen Token-Tarif; die App berechnet daraus eine ausdrücklich gekennzeichnete Schätzung für 720p.

| Bereich | Hauptkarten | Gemeinsame Startwerte |
| --- | --- | --- |
| Bilder | Grok Imagine 2.0, Recraft 4.1, Qwen Image 3, Z-Image Turbo, Soul 2, Ideogram 4.0 | 1:1, ohne Referenz; 1K, Soul 2: 720p, Ideogram: Modellvorgabe |
| Videos | Wan 3.0 Prime, LTX 2.5 Fast, LTX 2.5 Pro, PixVerse 6, Seedance 2.5, Kling 3.0 Standard | 720p, 16:9, 6 Sekunden, Audio aus; Kling: Modellvorgabe |

Das freie Testfeld enthält dieselben sechs Bildmodelle für separate Aufträge.

Weitere Videomodelle: Kling 3.0 Turbo, MiniMax H3 Preview, Grok Imagine Video 1.5, Wan 2.7 und MiniMax Hailuo 2.3 Standard. Das Dropdown enthält insgesamt elf geprüfte Videomodelle. Varianten werden ausdrücklich angezeigt.

Sunburst hat einen dokumentierten Endpunkt unter `marketing-studio/image/sunburst`. Seine Schätzantwort enthält jedoch nur eine Token-Tarifbeschreibung und keine numerische accountbezogene USD-Schätzung. Seedance 2.0 und Wan 3.0 lieferten ebenfalls nur Tarifbeschreibungen und sind nicht enthalten. Seedance 2.5 ist mit der unten beschriebenen Tarifberechnung angebunden. Nano Banana 2, Seedream 5.0 Pro, FLUX.3 Video und Flare werden ebenfalls nicht als angebundene Modelle angeboten. Es werden keine Modell-IDs erfunden oder stillschweigend umgeleitet.

## Ausblick auf V2: Jev wählt das passende Modell

**Geplant, noch nicht implementiert.** In den nächsten Wochen sind Benchmarks mit den Bild- und Videomodellen vorgesehen. Sie sollen zeigen, welches Modell für welche Aufgaben geeignet ist und welche Qualität es zu welchen Kosten liefert. Daraus entstehen nachvollziehbare Auswahlregeln. Erst wenn diese Regeln belastbar sind, wird Jev als Klassifizierungsmodell eingebunden.

In V2 soll der Jev-Klassifizierer ganz unten in der App das bisherige **„Freie Testfeld“ ersetzen**. Dort gibst du deinen Prompt ein. Jev erkennt die Anforderungen der Aufgabe; die App wählt anhand der Benchmark-Regeln und aktuellen Kostenschätzungen das günstigste verfügbare Modell, das die Aufgabe mit ausreichender Qualität erledigen kann, und leitet den Auftrag dorthin weiter.

Der geplante Ablauf:

1. Prompt und gewünschte Ausgabe eingeben.
2. Jev klassifiziert die Aufgabe und ihre Qualitätsanforderungen.
3. Die App berücksichtigt die getesteten Modellstärken, technische Anforderungen und aktuelle Kosten.
4. Das günstigste ausreichend geeignete Modell wird ausgewählt. Modell und Kostenschätzung sind vor dem kostenpflichtigen Start sichtbar.

Das Ziel ist eine verlässliche Auswahl nach Preis und Qualität. Ein niedriger Preis allein genügt nicht; die Eignung muss durch die Benchmarks und daraus abgeleiteten Regeln gestützt sein. Die bestehenden Modellvergleiche liefern dafür die Grundlage und bleiben auch in V2 verfügbar. Ein Veröffentlichungstermin steht noch nicht fest.

## Weitere Idee: lokale KI-Videos mit ComfyUI

**Idee für eine spätere Erweiterung, noch nicht implementiert und ohne festen Versionstermin.** Zusätzlich zu den bestehenden Bereichen sind zwei weitere Tabs für lokale KI-Videogenerierung über ComfyUI angedacht. Die genaue Aufteilung und die Namen sind noch offen. Eine mögliche Aufteilung wäre Text-zu-Video sowie Bild-/Referenz-zu-Video.

Als Ausgangspunkt existieren bereits lokale MiniMax-H3-Workflows für Text-zu-Video, Bild-zu-Video und Referenz-zu-Video, einschließlich einer Variante mit Audio-/Videoreferenzen. Die Workflow-Dateien und zugehörige Modellgewichte wurden in der vorhandenen Installation gesichtet. Das bestätigt eine Grundlage für die spätere Anbindung, aber noch keine fertige Integration in diese App oder Funktionsfähigkeit auf anderen Rechnern. Es wurden dafür keine neuen Generierungstests ausgeführt.

Die Erweiterung soll folgende Anwendungsfälle berücksichtigen:

- **Lokale Erstellung und Vergleich:** Prompts und Referenzen an ausgewählte, geprüfte ComfyUI-Workflows übergeben; Fortschritt, Laufzeit, Ergebnisse, Verlauf und Downloads in der App anzeigen.
- **Passende Hardware und Workflows:** ComfyUI-Verbindung, benötigte Modelle und Custom Nodes prüfen. Fehlende Voraussetzungen sichtbar machen. Auflösung, Videolänge, Quantisierung, RAM-/VRAM-Bedarf und Warteschlange bei der Auswahl berücksichtigen.
- **Vergleichbare Benchmarks:** Neben dem Modell auch Workflow-Version, Modellvariante, Einstellungen und verwendete Hardware festhalten. Lokale Laufzeiten sind nicht ohne Weiteres auf andere Rechner übertragbar.
- **Ehrliche Kostenanzeige:** Bei vollständig lokaler Generierung fallen keine Generierungsgebühren eines API-Anbieters an. Strom-, Hardware- und Zeitaufwand bleiben dennoch relevant; unbekannte Kosten sollen als unbekannt erscheinen und nicht pauschal als kostenlos gelten.

Für die Umsetzung ist ein eigener ComfyUI-Adapter im lokalen Backend vorgesehen, der geprüfte Workflows über die lokale ComfyUI-Schnittstelle ansteuert. Die vorhandene ComfyUI-Installation soll weiterverwendet werden. Modellgewichte, private Eingaben und Ergebnisse gehören nicht in dieses Repository; erforderliche Modelle, Custom Nodes und deren jeweilige Lizenzen müssen später je Workflow dokumentiert werden.

### Zusammenspiel mit dem geplanten Jev-Routing

Sobald belastbare Benchmarks und Auswahlregeln auch für lokale Workflows vorliegen, soll Jev diese als weitere Kandidaten berücksichtigen können. Das Ziel bleibt das günstigste ausreichend geeignete Modell; zusätzlich zählen lokale Verfügbarkeit, Hardwaregrenzen und akzeptable Wartezeit. Ein lokaler Workflow soll nur dann empfohlen werden, wenn die erforderliche Ausstattung und die Qualitätsanforderungen zusammenpassen.

Die Auswahl zwischen lokalem Betrieb und API-Anbietern soll ausdrücklich steuerbar sein. Ein lokaler Auftrag darf nicht unbemerkt an einen Cloud-Anbieter weitergeleitet werden. Auch die Jev-Klassifizierung über TypeSafe ist ein externer API-Aufruf: Für einen vollständig lokalen Ablauf müsste dieses Routing deaktiviert oder durch lokale Regeln beziehungsweise einen separat geprüften lokalen Klassifizierer ersetzt werden.

## Bedienung

1. Bilder oder Videos wählen. Jeder Tab behält seine eigenen Einstellungen. Der Prompt und die hochgeladenen Referenzen bleiben gemeinsam.
2. Prompt eingeben. Die sechs Hauptmodelle sind vorausgewählt und einzeln abwählbar. „Vergleichseinstellungen einsetzen“ stellt die oben genannten Werte einschließlich der sichtbar abweichenden Kartenauflösungen ausdrücklich wieder her. Es verändert weder Prompt noch Referenzen.
3. „Kosten prüfen & vergleichen“ ruft für jeden Auftrag die Kosten mit exakt den späteren Parametern ab; Seedance zeigt eine Tarifschätzung mit Rechengrundlage. Erst „Jetzt starten“ bestellt den Lauf. Jede Hauptkarte kann auch einzeln starten.
4. Das freie Testfeld beginnt leer und bleibt immer außerhalb des Vergleichslaufs. Nach Modellauswahl zeigt es inkompatible Einstellungen. „Passende Einstellungen einsetzen“ übernimmt auf Klick ein gültiges Profil für dieses Modell.
5. Ergebnisse werden automatisch lokal gespeichert. Im Verlauf stehen Prompt, Parameter, Request-ID, Laufzeit, Status, Schätzung und Ist-Kosten. Einzeldownload und ZIP je Lauf sind verfügbar. ZIP enthält Ergebnisse und `lauf.json`.

Pro Modell und Lauf genau ein Ergebnis. Maximal zwei Jobs gleichzeitig. Unterstützte Prompt-Erweiterungen werden ausgeschaltet, damit die gleichen Prompts unverändert an die Modelle gehen.

### Referenzbilder

PNG, JPEG oder WebP, maximal vier Uploads mit jeweils 10 MB. Ein Upload überträgt die Datei an Higgsfield und speichert eine lokale Kopie.

- Grok Imagine 2.0: bis vier Referenzen, lokale App-Grenze.
- Qwen Image 3: bis drei Referenzen über den geprüften Edit-Endpunkt.
- Ideogram 4.0: eine Referenz.
- Wan 3.0 Prime und LTX 2.5 Fast/Pro: ein Startbild über den jeweiligen Image-to-Video-Endpunkt, mit weiterhin ausdrücklich gesetztem Seitenverhältnis.
- Grok Imagine Video 1.5: bis vier Referenzen, lokale App-Grenze.
- Andere Adapter unterstützen in dieser App keinen Referenzmodus. Sie melden die Inkompatibilität vor dem Start. Für Referenzvergleiche diese Modelle abwählen.

### Modelle mit speziellen Vorgaben

Kling 3.0 Standard hat keinen Auflösungsparameter. Ideogram hat ebenfalls keine wählbare Auflösung. MiniMax H3 unterstützt 2K und keinen Audio-Schalter. Hailuo 2.3 Standard hat im geprüften Schema keine Parameter für Auflösung, Seitenverhältnis oder Audio. Bei solchen Modellen wählt das explizite Einstellungsprofil „Modellvorgabe“ und sendet keinen erfundenen Parameter. Kling und Ideogram sind Hauptkarten mit sichtbar gewählter Modellvorgabe. Soul 2 steht auf 720p. Jede Hauptkarte hat ein eigenes Auflösungsmenü; „Gemeinsame Einstellung“ übernimmt den globalen Wert. Die Quote zeigt die wirksame Auflösung und exakten Parameter jedes Auftrags. Ungültige Kombinationen werden weiterhin gesperrt.

## Kosten und Ausgabenlimit

Schätzungen stammen von `/estimate/<model>` mit identischem Request-JSON. Sie gelten zwei Minuten. Fehlende USD-Werte ohne unterstützte Tarifberechnung sperren die Bestellung. Listenpreise oder Rabattwerbung werden nicht als Kontopreis ausgegeben.

**Seedance 2.5:** Die aktuelle API nennt 0,0214 USD je 1.000 Video-Tokens vor Kundenrabatten. Für Text-to-Video bei 720p berechnet die App `ceil(Sekunden × angenommene Breite × angenommene Höhe × 24 / 1024) × 0.0214 / 1000`. Die nominalen Pixelmaße stammen aus der [BytePlus-Auflösungstabelle](https://docs.byteplus.com/en/docs/Byteplus_LAS/Large_model_billing). Beispiel 16:9: angenommen 1280 × 720; sechs Sekunden ergeben 2,77344 USD. Das ist eine Tarifschätzung, kein kontobezogener Preis und keine Preisgarantie. Die tatsächlichen Ausgabeabmessungen und Kosten können abweichen. Die Annahmen und Quelle bleiben in Quote und Verlauf erhalten, die Konto-Schätzung bleibt `null`. Bei geänderter API-Tarifbeschreibung, 480p oder Referenzen wird keine Zahl geraten: Der Start bleibt gesperrt. Für Seedance ist derzeit ausschließlich Text-to-Video angebunden.

**Ist-Kosten bleiben `null` und „noch nicht verfügbar“.** Die geprüfte Statusantwort liefert keinen verifizierten Abrechnungswert. Eine Schätzung wird niemals zur Ist-Abrechnung umetikettiert.

Das anfängliche lokale Gesamtlimit beträgt 1 USD. Reservierungen werden vor dem Versand gespeichert. Erfolgreiche und unklare Aufträge bleiben reserviert; bestätigte Fehler und Abbrüche geben die Reservierung frei. Die Anzeige ist weder API-Guthaben noch Rechnung. Sie berücksichtigt ausschließlich Aufträge dieser Installation.

Ein Vergleich aller Videomodelle kann mehr als 1 USD kosten. Dafür **selbst** unter „Ausgabenlimit anpassen“ ein höheres Gesamtlimit speichern oder weniger Modelle wählen. Diese Aktion startet keine Generierung. Die Limitänderung bleibt lokal nach Neustart erhalten und darf nicht unter die bereits reservierte Summe fallen. Ohne gespeicherte Änderung gilt `MAX_SPEND_USD` aus der Umgebung, standardmäßig 1.

Das Limit beruht auf API-Schätzungen und ist keine verbindliche Preisgarantie bei nachträglicher Anbieterabrechnung. `data/state.json` nicht löschen, um das Ausgabenlimit zu umgehen. Nur eine App-Instanz pro Datenverzeichnis kann laufen.

## Fehler und Wiederaufnahme

Kostenpflichtige POSTs werden nie automatisch wiederholt. Ein doppelter Startklick verwendet dieselbe lokale Lauf-ID. Bei unklarer Übertragung bleiben Auftrag und Reservierung stehen. Dann zuerst die Higgsfield Console prüfen.

Polling verwendet Backoff und pausiert nach fünf aufeinanderfolgenden Fehlern oder 30 Minuten. „Status erneut prüfen“ fragt dieselbe Request-ID ab. Auch nach Serverneustart werden laufende Aufträge pausiert, nicht erneut bestellt. „Ergebnis erneut speichern“ wiederholt nur den Download, ohne eine neue Generierung.

## Projektdateien

- `server.mjs`: localhost-Backend, Budget, Warteschlange, Upload, Polling, Downloads.
- `src/models.mjs`: verifizierte REST-Adapter, Fähigkeiten, Varianten, Quellen und Einstellungsprofile.
- `src/pricing.mjs`: gekennzeichnete Seedance-Tarifberechnung mit geprüfter Formel und sichtbaren Annahmen.
- `src/provider.mjs`: API-Zugriff. `src/zip.mjs`: ZIP-Export ohne Abhängigkeiten.
- `public/`: deutsche Oberfläche, mitgelieferte Brand-Assets und lokal gespeicherte Schriften.
- `data/state.json`, `data/media/`, `data/uploads/`: privater Verlauf, Ergebnisse, Referenzen. Vor Änderungen sichern.

## Sicherheit und lokaler Betrieb

Der Server bindet ausschließlich `127.0.0.1`, prüft Host und Origin und schützt Schreibaufrufe mit einem Sitzungstoken. Keine Telemetrie und keine externen Schriftaufrufe. API und Medienübertragungen benötigen Internet. Ausgaben werden wegen der begrenzten Speicherung beim Anbieter direkt lokal heruntergeladen.

Diese App ist für einen lokalen Benutzer ausgelegt, nicht für öffentliche Bereitstellung oder untrusted Reverse Proxies. Referenzen und Prompts sind private Daten; `data/` und `.env` gehören nicht in Git.

## Tests

```powershell
npm test
npm run check
node scripts/api-audit.mjs
```

`npm test` und `npm run check` erzeugen keine API-Kosten. Integrationstests laufen in einem temporären Projektordner mit einem Provider-Ersatz, der externe Aufrufe blockiert. Der Audit braucht den laufenden App-Server und führt nur kostenlose Preisabfragen aus.

Die zwölf Tests prüfen sechs Hauptkarten pro Bereich, Auflösungsabweichungen, Tarifberechnung und ihre Sperren, gültige Profile für alle auswählbaren Modelle, Referenzübernahme, keine stillen Parameteränderungen, fehlende Kosten, Budgetgrenzen und -änderungen, Doppelklicks, parallele Aufträge, Fehlerfälle, ZIP und Neustart. Der kostenlose Audit speichert seine Ergebnisse unter `docs/api-audit.json`; der Ordner ist privat und wird nicht veröffentlicht.

## Lizenz und Quellen

App-Code: MIT, siehe `LICENSE`. Brand-Dateien stammen aus dem bereitgestellten Brand Kit; daraus entsteht keine allgemeine Erlaubnis zur Verwendung der Marke. Inter, Space Grotesk und JetBrains Mono stehen unter SIL OFL, Lizenztexte unter `public/brand/`.

[API-Preisliste](https://open.higgsfield.ai/pricing?tab=all), [Dokumentation](https://docs.higgsfield.ai/docs/llms.txt), [Abrechnung](https://docs.higgsfield.ai/docs/concepts/billing-and-retention), [Uploads](https://docs.higgsfield.ai/docs/concepts/file-uploads). Modellbezogene Dokumentation ist auf jeder Karte verlinkt.


## Community

[Zur Community](https://www.skool.com/ai-mit-arnie-ki-revolution)
