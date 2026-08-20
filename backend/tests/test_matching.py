import sys
import os
import unittest

# Adjust path to import app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.matching import calculate_cosine_similarity

class TestMatchingEngine(unittest.TestCase):
    def test_cosine_similarity(self):
        """
        Verify the mathematical correctness of our cosine similarity calculator.
        """
        v1 = [1.0, 0.0, 0.0]
        v2 = [1.0, 0.0, 0.0]
        # Identical vectors
        self.assertAlmostEqual(calculate_cosine_similarity(v1, v2), 1.0)
        
        # Orthogonal vectors
        v3 = [0.0, 1.0, 0.0]
        self.assertAlmostEqual(calculate_cosine_similarity(v1, v3), 0.0)
        
        # Mismatched lengths
        self.assertEqual(calculate_cosine_similarity([1.0], [1.0, 2.0]), 0.0)

    def test_empty_vectors(self):
        self.assertEqual(calculate_cosine_similarity([], []), 0.0)

if __name__ == '__main__':
    unittest.main()
