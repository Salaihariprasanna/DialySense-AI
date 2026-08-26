import json
import logging
from typing import Dict, List, Set, Any
from fastapi import WebSocket

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Map session_id -> Set of WebSockets
        self.active_sessions: Dict[int, Set[WebSocket]] = {}
        # Global listeners for dashboard overall feed
        self.global_connections: Set[WebSocket] = set()

    async def connect_session(self, websocket: WebSocket, session_id: int):
        await websocket.accept()
        if session_id not in self.active_sessions:
            self.active_sessions[session_id] = set()
        self.active_sessions[session_id].add(websocket)
        logger.info(f"WebSocket connected to session {session_id}. Active listeners: {len(self.active_sessions[session_id])}")

    async def connect_global(self, websocket: WebSocket):
        await websocket.accept()
        self.global_connections.add(websocket)
        logger.info(f"Global WebSocket connected. Active listeners: {len(self.global_connections)}")

    def disconnect_session(self, websocket: WebSocket, session_id: int):
        if session_id in self.active_sessions and websocket in self.active_sessions[session_id]:
            self.active_sessions[session_id].remove(websocket)
            if not self.active_sessions[session_id]:
                del self.active_sessions[session_id]
            logger.info(f"WebSocket disconnected from session {session_id}")

    def disconnect_global(self, websocket: WebSocket):
        if websocket in self.global_connections:
            self.global_connections.remove(websocket)
            logger.info("Global WebSocket disconnected")

    async def broadcast_session(self, session_id: int, message: Dict[str, Any]):
        """
        Broadcasts telemetry, risk, or alerts to all sockets monitoring a specific session.
        """
        # Ensure session_id is int
        sid = int(session_id)
        if sid in self.active_sessions:
            dead_sockets = []
            for ws in list(self.active_sessions[sid]):
                try:
                    await ws.send_json(message)
                except Exception as e:
                    logger.warning(f"Error sending message to websocket in session {sid}: {e}")
                    dead_sockets.append(ws)
            for ws in dead_sockets:
                self.disconnect_session(ws, sid)
        
        # Also broadcast to global dashboard listeners
        await self.broadcast_global(message)

    async def broadcast_global(self, message: Dict[str, Any]):
        """
        Broadcasts events to global overview listeners.
        """
        dead_sockets = []
        for ws in list(self.global_connections):
            try:
                await ws.send_json(message)
            except Exception as e:
                logger.warning(f"Error sending message to global websocket: {e}")
                dead_sockets.append(ws)
        for ws in dead_sockets:
            self.disconnect_global(ws)

ws_manager = ConnectionManager()
