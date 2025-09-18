class PriorityQueue:
    """
    A priority queue implementation using a binary heap.
    Higher values have higher priority.
    """
    
    def __init__(self):
        self.heap = []
        self.size = 0
        
    def parent(self, i):
        """Return the parent index of i."""
        return (i - 1) // 2
        
    def left_child(self, i):
        """Return the left child index of i."""
        return 2 * i + 1
        
    def right_child(self, i):
        """Return the right child index of i."""
        return 2 * i + 2
        
    def has_parent(self, i):
        """Check if i has a parent."""
        return self.parent(i) >= 0
        
    def has_left_child(self, i):
        """Check if i has a left child."""
        return self.left_child(i) < self.size
        
    def has_right_child(self, i):
        """Check if i has a right child."""
        return self.right_child(i) < self.size
        
    def swap(self, i, j):
        """Swap elements at indices i and j."""
        self.heap[i], self.heap[j] = self.heap[j], self.heap[i]
        
    def sift_up(self, i):
        """Sift up the element at index i to maintain heap property."""
        while self.has_parent(i) and self.heap[i][0] > self.heap[self.parent(i)][0]:
            self.swap(i, self.parent(i))
            i = self.parent(i)
            
    def sift_down(self, i):
        """Sift down the element at index i to maintain heap property."""
        max_index = i
        
        if self.has_left_child(i) and self.heap[self.left_child(i)][0] > self.heap[max_index][0]:
            max_index = self.left_child(i)
            
        if self.has_right_child(i) and self.heap[self.right_child(i)][0] > self.heap[max_index][0]:
            max_index = self.right_child(i)
            
        if i != max_index:
            self.swap(i, max_index)
            self.sift_down(max_index)
            
    def insert(self, priority, item):
        """Insert an item with the given priority."""
        self.heap.append((priority, item))
        self.size += 1
        self.sift_up(self.size - 1)
        
    def extract_max(self):
        """Extract and return the item with the highest priority."""
        if self.size == 0:
            return None
            
        result = self.heap[0]
        
        self.heap[0] = self.heap[self.size - 1]
        self.heap.pop()
        self.size -= 1
        
        if self.size > 0:
            self.sift_down(0)
            
        return result
        
    def peek(self):
        """Return the item with the highest priority without removing it."""
        if self.size == 0:
            return None
        return self.heap[0]
        
    def is_empty(self):
        """Check if the priority queue is empty."""
        return self.size == 0
        
    def get_all_sorted(self):
        """Return all items sorted by priority (highest first)."""
        # Create a copy of the heap to avoid modifying the original
        temp_heap = self.heap.copy()
        result = []
        
        # Extract all items in order
        while temp_heap:
            priority, item = temp_heap[0]
            result.append(item)
            
            temp_heap[0] = temp_heap[-1]
            temp_heap.pop()
            
            i = 0
            while True:
                max_index = i
                left = 2 * i + 1
                right = 2 * i + 2
                
                if left < len(temp_heap) and temp_heap[left][0] > temp_heap[max_index][0]:
                    max_index = left
                    
                if right < len(temp_heap) and temp_heap[right][0] > temp_heap[max_index][0]:
                    max_index = right
                    
                if i == max_index:
                    break
                    
                temp_heap[i], temp_heap[max_index] = temp_heap[max_index], temp_heap[i]
                i = max_index
                
        return result
