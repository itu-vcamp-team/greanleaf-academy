from abc import ABC, abstractmethod
from typing import Generic, TypeVar, List, Optional
from src.datalayer.database import PrimaryKeyType

T = TypeVar('T')


class ISyncRepository(ABC, Generic[T]):
    """Abstract base repository defining the synchronous interface"""
    
    @abstractmethod
    def get_by_id(self, id: PrimaryKeyType) -> Optional[T]:
        """Get entity by primary key"""
        pass
    
    @abstractmethod
    def get_all(self, limit: Optional[int] = None, offset: Optional[int] = None) -> List[T]:
        """Get all entities with optional pagination"""
        pass
    
    @abstractmethod
    def find_by(self, **filters) -> List[T]:
        """Find entities by filter criteria"""
        pass
    
    @abstractmethod
    def find_one_by(self, **filters) -> Optional[T]:
        """Find single entity by filter criteria"""
        pass
    
    @abstractmethod
    def save(self, entity: T) -> T:
        """Save (insert or update) entity"""
        pass
    
    @abstractmethod
    def save_all(self, entities: List[T]) -> List[T]:
        """Save multiple entities"""
        pass
    
    @abstractmethod
    def delete(self, entity: T) -> None:
        """Delete entity"""
        pass
    
    @abstractmethod
    def delete_by_id(self, id: PrimaryKeyType) -> bool:
        """Delete entity by ID, returns True if deleted"""
        pass
    
    @abstractmethod
    def exists(self, id: PrimaryKeyType) -> bool:
        """Check if entity exists by ID"""
        pass
    
    @abstractmethod
    def count(self, **filters) -> int:
        """Count entities with optional filters"""
        pass


class IRepository(ABC, Generic[T]):
    """Abstract base repository defining the asynchronous interface (Primary)"""
    
    @abstractmethod
    async def get_by_id(self, id: PrimaryKeyType) -> Optional[T]:
        """Get entity by primary key"""
        pass
    
    @abstractmethod
    async def get_all(self, limit: Optional[int] = None, offset: Optional[int] = None) -> List[T]:
        """Get all entities with optional pagination"""
        pass
    
    @abstractmethod
    async def find_by(self, **filters) -> List[T]:
        """Find entities by filter criteria"""
        pass
    
    @abstractmethod
    async def find_one_by(self, **filters) -> Optional[T]:
        """Find single entity by filter criteria"""
        pass
    
    @abstractmethod
    async def save(self, entity: T) -> T:
        """Save (insert or update) entity"""
        pass
    
    @abstractmethod
    async def save_all(self, entities: List[T]) -> List[T]:
        """Save multiple entities"""
        pass
    
    @abstractmethod
    async def delete(self, entity: T) -> None:
        """Delete entity"""
        pass
    
    @abstractmethod
    async def delete_by_id(self, id: PrimaryKeyType) -> bool:
        """Delete entity by ID, returns True if deleted"""
        pass
    
    @abstractmethod
    async def exists(self, id: PrimaryKeyType) -> bool:
        """Check if entity exists by ID"""
        pass
    
    @abstractmethod
    async def count(self, **filters) -> int:
        """Count entities with optional filters"""
        pass
