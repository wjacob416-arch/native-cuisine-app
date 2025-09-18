import sqlite3

class Node:
    def __init__(self, end_of_word=False):
        self.end_of_word = end_of_word
        self.children = {}

class Trie:
    """
    A simple trie for autocompleting recipe names or ingredients.
    Can be populated from any iterable of strings, including a SQLite database.
    """
    def __init__(self):
        self.root = Node()

    def insert(self, word: str) -> None:
        current = self.root
        for ch in word.lower():
            if ch not in current.children:
                current.children[ch] = Node()
            current = current.children[ch]
        current.end_of_word = True

    def search(self, word: str) -> bool:
        current = self.root
        for ch in word.lower():
            if ch not in current.children:
                return False
            current = current.children[ch]
        return current.end_of_word

    def _collect(self, node: Node, prefix: str, results: list):
        if node.end_of_word:
            results.append(prefix)
        for ch, child in node.children.items():
            self._collect(child, prefix + ch, results)

    def autocomplete(self, prefix: str) -> list:
        node = self.root
        for ch in prefix.lower():
            if ch not in node.children:
                return []
            node = node.children[ch]
        results = []
        self._collect(node, prefix, results)
        return results

    @classmethod
    def from_database(cls, db_path: str, column: str = 'name') -> 'Trie':
        """
        Build a Trie from values in a SQLite table 'recipies'.
        Specify column='name' for recipe names or 'ingredients' for ingredients list.
        """
        trie = cls()
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cur = conn.execute(f"SELECT {column} FROM recipies;")
        for row in cur.fetchall():
            text = row[column] or ''
            if column == 'ingredients':
                # split multiple ingredients by newline
                for ing in text.split('\n'):
                    if ing.strip():
                        trie.insert(ing)
            else:
                if text.strip():
                    trie.insert(text)
        conn.close()
        return trie
