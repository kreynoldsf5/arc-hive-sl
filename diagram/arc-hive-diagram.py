from diagrams import Cluster, Diagram, Edge
from diagrams.onprem.client import Client, User, Users
from diagrams.onprem.network import Internet
from diagrams.onprem.database import Mongodb
from diagrams.aws.compute import Lambda
from diagrams.aws.network import Cloudfront, APIGateway
from diagrams.aws.storage import S3
from diagrams.azure.identity import ActiveDirectory

with Diagram("ArcHive Architecture", show=True):

    source = User("User")
 
    with Cluster("Frontend Services"):
        cdn = Cloudfront("CloudFront Distro")
        auth = ActiveDirectory("Azure AD")
        apiGW = APIGateway("API Gateway")
        store = S3("Binary Storage")

        frontsvc = [cdn, auth, apiGW, store]

    with Cluster("Backend Services"):
        react = S3("React App")
        with Cluster("Lambda Workers"):
            workers = [Lambda("proc"), Lambda("proc(n)"), Lambda("proc(n+1)")]
        with Cluster("MongoDB Atlas Cluster"):
            db_atlas = Mongodb("Primary")
            db_atlas - Mongodb("Secondary")
            db_atlas - Mongodb("Secondary")

        backsvc = [react, workers, db_atlas]

    ###Define relationships
    cdn >> Edge(style="bold") >> react
    apiGW >> Edge(style="bold") >> workers >> db_atlas
    source >> Edge(style="bold") >> frontsvc

