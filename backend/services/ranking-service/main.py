import grpc
from concurrent import futures
import time
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'proto'))

from proto import ranking_pb2_grpc, ranking_pb2
from proto import comment_pb2

class RankingServiceServicer(ranking_pb2_grpc.RankingServiceServicer):
    def SortComments(self, request, context):
        comments = list(request.comments)
        # ML Sorting Logic: Combine upvotes, recency (date of creation) into a composite score
        # For simplicity in this microservice, we calculate a score:
        # Score = Upvotes * 10 + (current_time - createdAt in seconds) / some_factor
        current_time = time.time()
        
        def calculate_score(comment):
            upvotes = comment.upvotes or 0
            return upvotes * 10 # This is a placeholder for complex ML
            
        sorted_comments = sorted(comments, key=calculate_score, reverse=True)
        return ranking_pb2.SortCommentsResponse(sorted_comments=sorted_comments)

def serve():
    port = os.environ.get('RANKING_SERVICE_PORT', '50057')
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    ranking_pb2_grpc.add_RankingServiceServicer_to_server(RankingServiceServicer(), server)
    server.add_insecure_port(f'[::]:{port}')
    server.start()
    print(f"🧠 ML Ranking Service running on port {port}")
    server.wait_for_termination()

if __name__ == '__main__':
    serve()