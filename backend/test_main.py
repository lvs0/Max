"""
Minimal tests for MAX backend.
Run with: python3 -m pytest test_main.py -v
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Mock ollama before importing main
with patch("ollama.chat") as mock_chat, \
     patch("ollama.list") as mock_list:
    
    mock_chat.return_value = {"message": {"content": "Test response"}}
    mock_list.return_value = {"models": [{"name": "qwen3:8b"}]}
    
    from main import app

client = TestClient(app)


class TestRootEndpoint:
    """Tests for GET /"""
    
    def test_root_returns_status_ok(self):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["name"] == "Max"


class TestChatEndpoint:
    """Tests for POST /chat"""
    
    def test_chat_requires_message(self):
        response = client.post("/chat", json={})
        assert response.status_code == 422  # Validation error
    
    def test_chat_accepts_valid_message(self):
        with patch("main.check_ollama_health") as mock_health:
            mock_health.return_value = True
            response = client.post("/chat", json={"message": "Hello"})
            assert response.status_code == 200
            data = response.json()
            assert "response" in data
            assert "conversation_id" in data
    
    def test_chat_accepts_custom_model(self):
        with patch("main.check_ollama_health") as mock_health:
            mock_health.return_value = True
            response = client.post("/chat", json={"message": "Hi", "model": "llama2"})
            assert response.status_code == 200


class TestMemoryEndpoints:
    """Tests for /memory"""
    
    def test_get_memory_returns_messages(self):
        response = client.get("/memory")
        assert response.status_code == 200
        data = response.json()
        assert "messages" in data
        assert isinstance(data["messages"], list)
    
    def test_clear_memory(self):
        response = client.delete("/memory")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "cleared"


class TestTasksEndpoints:
    """Tests for /tasks"""
    
    def test_get_tasks(self):
        response = client.get("/tasks")
        assert response.status_code == 200
        data = response.json()
        assert "tasks" in data
    
    def test_create_task(self):
        response = client.post("/tasks", json={
            "title": "Test task",
            "priority": "high"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "created"
        assert "id" in data
    
    def test_update_task(self):
        # Create first
        create_resp = client.post("/tasks", json={"title": "Task to update"})
        task_id = create_resp.json()["id"]
        
        # Update
        response = client.put(f"/tasks/{task_id}", json={
            "title": "Updated task",
            "completed": True
        })
        assert response.status_code == 200
        assert response.json()["status"] == "updated"
    
    def test_delete_task(self):
        # Create first
        create_resp = client.post("/tasks", json={"title": "Task to delete"})
        task_id = create_resp.json()["id"]
        
        # Delete
        response = client.delete(f"/tasks/{task_id}")
        assert response.status_code == 200
        assert response.json()["status"] == "deleted"
    
    def test_create_task_with_all_fields(self):
        response = client.post("/tasks", json={
            "title": "Full task",
            "due": "2025-12-31",
            "completed": False,
            "priority": "medium",
            "tag": "work"
        })
        assert response.status_code == 200


class TestStatsEndpoint:
    """Tests for /stats"""
    
    def test_stats_returns_system_info(self):
        response = client.get("/stats")
        assert response.status_code == 200
        data = response.json()
        assert "cpu" in data
        assert "memory" in data
        assert "disk" in data


class TestModelsEndpoint:
    """Tests for /models"""
    
    def test_models_returns_list(self):
        response = client.get("/models")
        assert response.status_code == 200
        data = response.json()
        assert "models" in data
        assert isinstance(data["models"], list)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])