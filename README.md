# WDD330---Final-Project

## ⚔️ Mists Warriors — A Dynamic, Persistent Story Web App

### 🧭 Overview
**Mists Warriors** is a dynamic storytelling web application that generates unique narrative events based on **real-world weather**, **geolocation**, and **true randomness**.  
Players explore a living story where every choice, delay, and change in the environment shapes the outcome.  

If the player leaves mid-scenario and returns later, the story logically continues — perhaps days have passed, the weather has changed, or fate has moved on without them.  

---

### 🌐 APIs Used
1. **WeatherAPI | Open Mateo** — provides real-time weather and moon phase data to influence environmental descriptions and behavior logic.  
2. **Geolocation API** — retrieves player location to load corresponding local weather and story context.  
3. **True Randomness API (random.org)** — generates unpredictable story events and chance-based outcomes. 
4. **Overpass API** — determines urban vs wild areas based on building density, reducing load on heavy land cover datasets.
5. **Copernicus Land Cover** — if user is in a more "wild" environment, the game recognizes and produces an event that is appropriate.

Each API call contributes directly to story generation and persistent world logic, meeting the rubric requirement for *non-trivial external data usage.*

---

### 🧩 Core Features

- **🌦️ Dynamic Weather Integration**  
  Story events adapt to current weather conditions (e.g., rain, fog, clear skies, storms).  
  If the weather changes mid-event, the DOM updates with transitional narrative text.

- **🌙 Moon Phase Logic**  
  At night, events alter based on the current moon phase — full moons can trigger dangerous or chaotic situations in both city and wild settings.

- **📍 Geolocation Awareness**  
  The player’s region influences story tone, time of day, and available encounters.

- **🎲 True Random Events**  
  A randomness API ensures no two playthroughs are ever the same, even in identical conditions.

- **⏰ Time-Out Event System**  
  If the player leaves during a time-sensitive event and returns later, the story advances naturally (e.g., a captured traitor escapes, missions fail, or opportunities slip away).

- **💾 Persistent State**  
  Choices, current scenario, and player stats are saved to `localStorage`. Returning players pick up where they left off, and the world reacts accordingly.

- **🪟 Multi-Window UI (Desktop Implementation)**  
  Separate windows for *Inventory*, *Menu*, and *Story* sections allow live updates to shared game state.

- **Animated text and transitions for event descriptions**
    Background image fade-ins for environmental immersion.
    Interactive buttons with hover effects for player choices.

---

### 📂 JSON Storyboard Structure

The story system is built from nested JSON data that adapts based on environment factors like weather, player choices including activity level, and real world biome:
    - Modular JSON allows multi-class, multi-region, and multi-weather branching.
    - Timeout responses enable story continuity if the player leaves mid-event.
    - Images tied to events allow dynamic visual storytelling.

```json
{
    "Warrior": {
        "Urban": {
            "Rain": {
                "Event_1": {
                    "event-id": 1,
                    "description": "As the streets begin to retain the rain, the street gutters and shallow ditches starting to fill, you see the silhouette of a figure at the end of the street staring at you. As you catch his gaze, alarmed he dashes farther down the road.   With the rain the alleyway is fairly deserted but you see an adventuring party making their way out of the door to the local inn as the shadowy character passes. What do you do?",
                    "ambientChange": {
                        "clear": "It appears the rain has settled, but your focus remains on the man you saw staring at you.",
                        "storm": "The rain has picked up, finding clues to who the man is will be more difficult.",
                        "snow": "It seems the weather has taken a turn for the worse, tracking the shadow will be almost impossible now.",
                        "fog": "The rain has cleared but a dense fog could make tracking that much more difficult."
                    },
                    "timeoutResponse": "Days have passed since your hesitation — the figure is surely gone, along with whatever he was collecting information for.",
                    "image": "url.for.image",
                    "next-eventID": 5
                },
                "Event_2": {
                    "event-id": 2,
                    "description": "The smell of the rain as you stand in the doorway hoping for something interesting to come along; just a dreary, miserable day. All of a sudden a man bursts through you, coat wet from the weather and sweat, stumbling from the impact he turns to face you. 'Help! They're after me, those MONSTERS!' Then pointing to an abandoned house on the edge of town. 'You have to help me! I... I'll give you whatever you want.' pulling out a bag of coins. He's terrified but seems honest enough, what do you do?",
                    "ambientChange": {
                        "clear": "It appears the rain has settled, although, the man's expression has not.",
                        "storm": "Thunder crashes, a storm has moved in, it feels crazy but you wonder if the man had anything to do about it.",
                        "snow": "It looks like the snow has moved in, the temperature is dropping and you aren't sure what awaits you at that abandoned house. ",
                        "fog": "The clearing of the rain may have calmed him down a bit, but the fog adds a level of unease that seems to even be getting under your skin."
                    },
                    "timeoutResponse": "As you return the man is gone, the house he was pointing at, disappeared; you wander off wondering if he had just been a bad dream.",
                    "image": "url.for.image",
                    "next-eventID": 6
                }
                // Additional events follow similar structure
            }
        }
    }
}
```

This modular design enables flexible, data-driven narrative development.

### 🧱 Development Framework
Phase	Tasks
Framework	Build HTML/CSS base, integrate 5 APIs, generate storyboard JSON
Implementation	Add ambient and timeout responses, polish UI, multi-window logic
Testing	Validate API handshakes, persistent states, device responsiveness

Trello is used for project tracking and version planning.

### 🧠 Technologies Used
HTML5 / CSS3 / JavaScript (ES6)

LocalStorage for persistence

Trello for project management

GitHub Pages for hosting

APIs: WeatherAPI, Geolocation, True Randomness, Overpass, Copernicus

### 🧪 Rubric Highlights
- ✅ Multiple APIs integrated (WeatherAPI, Geolocation, True Randomness)
- ✅ JSON-based dynamic content
- ✅ Robust JavaScript logic beyond class examples
- ✅ Persistent world and reactive DOM
- ✅ Responsive and accessible design
- ✅ Animations / advanced styling
  - **Text fade-ins and transitions**
  - **Background image fade-in**
  - **Button hover effects**
  - **Sliding panels for multi-window UI**

### 🚀 Deployment
The project will be hosted via GitHub Pages.

Link: [https://github.com/Nathaniel-Stokes35/WDD330---Final-Project]

👤 Author
Nathaniel Stokes
Software & Web Development Student at BYU–Idaho - WDD330
📧 Contact: [nathaniel.stokes35@gmail.com]
