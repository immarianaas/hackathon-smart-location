import os
import requests
from collections import defaultdict


ENTITIES_PATH = os.path.join('..', 'entities')
URL = 'http://localhost:1026/v2/entities'

def post_file_content( file_path ):
    with open(file_path, 'r') as f:    
        res = requests.post(URL, data=f, headers={"Content-Type": "application/json"})
        
        print( f'* {file_path.split("/")[-1]:40} : status code = {res.status_code} ; additional info = {res._content}' )
        return res.status_code

def main():

    overall_status = defaultdict(lambda: 0)
    total_files_send = 0

    for entity_file_path in [ os.path.join(ENTITIES_PATH, e) for e in os.listdir(os.path.join(ENTITIES_PATH)) if e.split('.')[-1] == 'json']:

        total_files_send += 1

        overall_status[ post_file_content( entity_file_path ) ] += 1


    print()     
    print( f'total number of entries: {total_files_send}')
    for k in overall_status.keys():
        print( f'=> status code n. {k} found {overall_status[k]} times' )


if __name__ == "__main__":
    main()