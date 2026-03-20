from flask import Flask, render_template, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import random
import datetime

app = Flask(__name__)
CORS(app)

# Oyun verileri
game_data = {
    "player_stats": {
        "health": 100,
        "score": 0,
        "crystals": 0,
        "level": 1,
        "inventory": []
    },
    "chapters": {
        1: {
            "title": "Kristal Kale'nin Sırrı",
            "unlocked": True,
            "completed": False,
            "progress": 0
        },
        2: {
            "title": "Gizemli Orman",
            "unlocked": False,
            "completed": False,
            "progress": 0
        },
        3: {
            "title": "Kaybolmuş Anahtarlar",
            "unlocked": False,
            "completed": False,
            "progress": 0
        },
        4: {
            "title": "Ejderhanın Yolu",
            "unlocked": False,
            "completed": False,
            "progress": 0
        },
        5: {
            "title": "Sihirli Kristaller",
            "unlocked": False,
            "completed": False,
            "progress": 0
        },
        6: {
            "title": "Final: Taç Giyme",
            "unlocked": False,
            "completed": False,
            "progress": 0
        }
    },
    "achievements": [],
    "save_time": None
}

# Ana sayfa
@app.route('/')
def index():
    return render_template('index.html')

# Oyun verileri endpoint'leri
@app.route('/api/game-data')
def get_game_data():
    return jsonify(game_data)

@app.route('/api/player-stats')
def get_player_stats():
    return jsonify(game_data["player_stats"])

@app.route('/api/chapters')
def get_chapters():
    return jsonify(game_data["chapters"])

@app.route('/api/update-stats', methods=['POST'])
def update_stats():
    data = request.json
    stats = game_data["player_stats"]
    
    # İstatistikleri güncelle
    if "health" in data:
        stats["health"] = max(0, min(100, stats["health"] + data["health"]))
    if "score" in data:
        stats["score"] += data["score"]
    if "crystals" in data:
        stats["crystals"] += data["crystals"]
    if "level" in data:
        stats["level"] = data["level"]
    if "inventory" in data:
        stats["inventory"].extend(data["inventory"])
    
    return jsonify({"success": True, "stats": stats})

@app.route('/api/chapter/<int:chapter_id>')
def get_chapter(chapter_id):
    if chapter_id in game_data["chapters"]:
        return jsonify(game_data["chapters"][chapter_id])
    return jsonify({"error": "Bölüm bulunamadı"}), 404

@app.route('/api/unlock-chapter/<int:chapter_id>', methods=['POST'])
def unlock_chapter(chapter_id):
    if chapter_id in game_data["chapters"]:
        game_data["chapters"][chapter_id]["unlocked"] = True
        return jsonify({"success": True})
    return jsonify({"error": "Bölüm bulunamadı"}), 404

@app.route('/api/complete-chapter/<int:chapter_id>', methods=['POST'])
def complete_chapter(chapter_id):
    if chapter_id in game_data["chapters"]:
        chapter = game_data["chapters"][chapter_id]
        chapter["completed"] = True
        chapter["progress"] = 100
        
        # Sonraki bölümü kilitle
        next_chapter = chapter_id + 1
        if next_chapter in game_data["chapters"]:
            game_data["chapters"][next_chapter]["unlocked"] = True
        
        return jsonify({"success": True, "next_chapter": next_chapter})
    return jsonify({"error": "Bölüm bulunamadı"}), 404

@app.route('/api/update-progress/<int:chapter_id>', methods=['POST'])
def update_progress(chapter_id):
    data = request.json
    if chapter_id in game_data["chapters"] and "progress" in data:
        game_data["chapters"][chapter_id]["progress"] = data["progress"]
        return jsonify({"success": True})
    return jsonify({"error": "Bölüm bulunamadı"}), 404

# Hikaye endpoint'leri
@app.route('/api/story/<int:chapter_id>')
def get_story(chapter_id):
    stories = {
        1: {
            "title": "Kristal Kale'nin Sırrı",
            "scenes": [
                {
                    "text": "Prenses Mine, Kristal Kale'nin en yüksek kulesinde uyanır. Kale karanlığa gömülmüş ve koruyucu kristaller kaybolmuştur.",
                    "choices": [
                        {"id": 1, "text": "Kaleyi ara", "action": "explore_castle"},
                        {"id": 2, "text": "Büyücüye git", "action": "visit_wizard"},
                        {"id": 3, "text": "Kütüphaneye git", "action": "go_library"}
                    ]
                },
                {
                    "text": "Mine koridorlarda yürürken duvarlardaki kristallerin söndüğünü fark eder. Ruhların fısıltıları duyulur.",
                    "choices": [
                        {"id": 4, "text": "Gizemli kapıyı aç", "action": "open_door"},
                        {"id": 5, "text": "Kapıyı dinle", "action": "listen_door"},
                        {"id": 6, "text": "İleri devam et", "action": "continue_forward"}
                    ]
                }
            ]
        },
        2: {
            "title": "Gizemli Orman",
            "scenes": [
                {
                    "text": "Mine, Gizemli Orman'a ulaşır. Orman binlerce yıldır yaşayan ağaçlarla doludur.",
                    "choices": [
                        {"id": 7, "text": "Işık patikası", "action": "light_path"},
                        {"id": 8, "text": "Göl patikası", "action": "lake_path"},
                        {"id": 9, "text": "Mağara patikası", "action": "cave_path"}
                    ]
                }
            ]
        }
    }
    
    if chapter_id in stories:
        return jsonify(stories[chapter_id])
    return jsonify({"error": "Hikaye bulunamadı"}), 404

@app.route('/api/make-choice', methods=['POST'])
def make_choice():
    data = request.json
    choice_id = data.get("choice_id")
    action = data.get("action")
    
    # Seçim sonuçları
    choice_results = {
        "explore_castle": {"success": True, "reward": 10, "message": "Kale'de ilginç şeyler keşfettin!"},
        "visit_wizard": {"success": True, "reward": 15, "message": "Büyücüden sihirli bir hediye aldın!"},
        "go_library": {"success": True, "reward": 12, "message": "Kütüphanede önemli ipuçları buldun!"},
        "open_door": {"success": True, "damage": 5, "reward": 20, "message": "Kapıyı açarken tuzağa rastladın ama kristal buldun!"},
        "listen_door": {"success": True, "reward": 8, "message": "Kapının arkasındaki sırrı öğrendin!"},
        "continue_forward": {"success": True, "reward": 5, "message": "Güvenli bir seçim yaptın."},
        "light_path": {"success": True, "reward": 18, "message": "Işık yolu seni parlak bir kristale götürdü!"},
        "lake_path": {"success": True, "damage": 10, "reward": 25, "message": "Göl yolu tehlikeliydi ama ödüllendiriciydi!"},
        "cave_path": {"success": True, "damage": 15, "reward": 30, "message": "Mağara korkutucuydu ama değerli bir şey buldun!"}
    }
    
    result = choice_results.get(action, {
        "success": False, 
        "damage": 5, 
        "message": "Bu seçim iyi değilmiş!"
    })
    
    return jsonify(result)

# Mini oyun endpoint'leri
@app.route('/api/mini-game/<game_type>')
def get_mini_game(game_type):
    games = {
        "memory": {
            "type": "memory",
            "title": "Hafıza Oyunu",
            "difficulty": "normal",
            "cards": ["💎", "🗡️", "🛡️", "🧪", "📜", "🔮", "⚡", "🌟"] * 2
        },
        "reflex": {
            "type": "reflex",
            "title": "Refleks Oyunu",
            "time_limit": 30,
            "target_count": 20
        },
        "puzzle": {
            "type": "puzzle",
            "title": "Bulmaca Oyunu",
            "grid_size": 3,
            "difficulty": "normal"
        },
        "quiz": {
            "type": "quiz",
            "title": "Bilgi Yarışması",
            "questions": [
                {
                    "question": "Kristal Kale'nin koruyucusu kimdir?",
                    "options": ["Prenses Mine", "Bilge Büyücü", "Ejderha Ignis", "Orman Ruhları"],
                    "correct": 1
                },
                {
                    "question": "Kayıp kristalllerden kaç tane vardır?",
                    "options": ["3", "5", "7", "9"],
                    "correct": 2
                }
            ]
        }
    }
    
    if game_type in games:
        return jsonify(games[game_type])
    return jsonify({"error": "Oyun bulunamadı"}), 404

@app.route('/api/save-game', methods=['POST'])
def save_game():
    data = request.json
    game_data.update(data)
    game_data["save_time"] = datetime.datetime.now().isoformat()
    return jsonify({"success": True, "save_time": game_data["save_time"]})

@app.route('/api/load-game')
def load_game():
    return jsonify(game_data)

@app.route('/api/reset-game', methods=['POST'])
def reset_game():
    global game_data
    game_data = {
        "player_stats": {
            "health": 100,
            "score": 0,
            "crystals": 0,
            "level": 1,
            "inventory": []
        },
        "chapters": {
            1: {
                "title": "Kristal Kale'nin Sırrı",
                "unlocked": True,
                "completed": False,
                "progress": 0
            },
            2: {
                "title": "Gizemli Orman",
                "unlocked": False,
                "completed": False,
                "progress": 0
            },
            3: {
                "title": "Kaybolmuş Anahtarlar",
                "unlocked": False,
                "completed": False,
                "progress": 0
            },
            4: {
                "title": "Ejderhanın Yolu",
                "unlocked": False,
                "completed": False,
                "progress": 0
            },
            5: {
                "title": "Sihirli Kristaller",
                "unlocked": False,
                "completed": False,
                "progress": 0
            },
            6: {
                "title": "Final: Taç Giyme",
                "unlocked": False,
                "completed": False,
                "progress": 0
            }
        },
        "achievements": [],
        "save_time": None
    }
    return jsonify({"success": True})

# Başarımlar
@app.route('/api/achievements')
def get_achievements():
    achievements = [
        {
            "id": "first_crystal",
            "title": "İlk Kristal",
            "description": "İlk kristali buldun!",
            "icon": "💎",
            "unlocked": False
        },
        {
            "id": "chapter_master",
            "title": "Bölüm Ustası",
            "description": "Bir bölümü %100 tamamladın!",
            "icon": "🏆",
            "unlocked": False
        },
        {
            "id": "dragon_friend",
            "title": "Ejderha Dostu",
            "description": "Ejderha ile dost oldun!",
            "icon": "🐉",
            "unlocked": False
        },
        {
            "id": "wise_ruler",
            "title": "Bilge Hükümdar",
            "description": "Oyunu bilgelikle tamamladın!",
            "icon": "👑",
            "unlocked": False
        }
    ]
    
    return jsonify(achievements)

@app.route('/api/unlock-achievement/<achievement_id>', methods=['POST'])
def unlock_achievement(achievement_id):
    # Başarım kilitleme mantığı
    return jsonify({"success": True})

# Liderlik tablosu
@app.route('/api/leaderboard')
def get_leaderboard():
    # Sahte liderlik tablosu verisi
    leaderboard = [
        {"rank": 1, "name": "Mine", "score": 2500, "crystals": 15},
        {"rank": 2, "name": "Ejderha", "score": 2200, "crystals": 12},
        {"rank": 3, "name": "Büyücü", "score": 1800, "crystals": 10},
        {"rank": 4, "name": "Orman Ruhu", "score": 1500, "crystals": 8},
        {"rank": 5, "name": "Kristal", "score": 1200, "crystals": 6}
    ]
    
    return jsonify(leaderboard)

# İstatistikler
@app.route('/api/stats')
def get_stats():
    stats = {
        "total_playtime": "2 saat 15 dakika",
        "chapters_completed": 0,
        "crystals_found": 0,
        "enemies_defeated": 0,
        "choices_made": 0,
        "mini_games_played": 0
    }
    
    return jsonify(stats)

# Static dosyaları serve et
@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

# Hata yönetimi
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Sayfa bulunamadı"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Sunucu hatası"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
