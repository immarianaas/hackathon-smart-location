import json
import requests
import time
import math

TIME_UPDATE = 1  # s
ENTITY_ID = "vehicle-1"
VELOCITY = 20  # km/h
R = 6371e3  # metres
DISTANCE_TRAVELLED = VELOCITY / 1000 * 3600 * TIME_UPDATE


def calc_dist(p1, p2):
    y1 = math.radians(p1[0] * math.pi / 180)  # φ, λ in radians
    y2 = math.radians(p2[0] * math.pi / 180)

    diff_lat = math.radians(p2[0] - p1[0])
    diff_lon = math.radians(p2[1] - p1[1])

    a = math.sin(diff_lat / 2) * math.sin(diff_lat / 2) + math.cos(y1)\
        * math.cos(y2) * math.sin(diff_lon / 2) * math.sin(diff_lon / 2)

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c  # in metres


def get_bearing_from_2_points(p1, p2):
    rlat1 = math.radians(p1[0])
    rlat2 = math.radians(p2[0])
    rlon1 = math.radians(p1[1])
    rlon2 = math.radians(p2[1])

    y = math.sin(rlon2 - rlon1) * math.cos(rlat2)
    x = math.cos(rlat1) * math.sin(rlat2) - \
        math.sin(rlat1) * math.cos(rlat2) * math.cos(rlon2 - rlon1)
    teta = math.atan2(y, x)
    return (teta * 180 / math.pi + 360) % 360


def get_point_from_bearing(p1, bearing, d):
    rlat1 = math.radians(p1[0])
    rlon1 = math.radians(p1[1])
    rbearing = math.radians(bearing)

    lat2 = math.asin(math.sin(rlat1) * math.cos(d / R) + math.cos(rlat1) * math.sin(d / R) * math.cos(rbearing))
    lon2 = rlon1 + math.atan2(math.sin(rbearing) * math.sin(d / R) * math.cos(rlat1),
                              math.cos(d / R) - math.sin(rlat1) * math.sin(lat2))
    return [math.degrees(lat2), ((math.degrees(lon2) + 540) % 360 - 180)]

with open("../entities/public-transport-stop-1.json", "r") as f:
    stop1 = json.loads(f.read())

with open("../entities/public-transport-stop-2.json", "r") as f:
    stop2 = json.loads(f.read())

stop1_coords = stop1["location"]["value"]["coordinates"]
stop2_coords = stop2["location"]["value"]["coordinates"]

stop_list = [stop1_coords, stop2_coords]
stop_list = stop_list + list(reversed(stop_list))

print(stop1_coords, stop2_coords, sep="\n")
current_target = stop2_coords
current_pos = stop1_coords
stop_index = 1


while True:

    distance_to_next_target = calc_dist(current_pos, current_target)
    brng = get_bearing_from_2_points(current_pos, current_target)
    new_pos = get_point_from_bearing(current_pos, brng, DISTANCE_TRAVELLED)

    distance_to_new_pos = calc_dist(current_pos, new_pos)

    print(distance_to_new_pos, distance_to_next_target)
    while distance_to_new_pos > distance_to_next_target:
        current_pos = current_target
        stop_index += 1
        current_target = stop_list[stop_index % len(stop_list)]
        rest_distance = distance_to_new_pos - distance_to_next_target

        distance_to_next_target = calc_dist(current_pos, current_target)
        brng = get_bearing_from_2_points(current_pos, current_target)
        new_pos = get_point_from_bearing(current_pos, brng, DISTANCE_TRAVELLED)

        distance_to_new_pos = calc_dist(current_pos, new_pos)

    dc = {"location": {"value": {"coordinates": new_pos}}}
    res = requests.patch(f"http://localhost:1026/v2/entities/{ENTITY_ID}/attrs", data=json.dumps(dc), headers={"Content-Type": "application/json"})
    print(new_pos, stop_index, current_target)
    current_pos = new_pos
    time.sleep(TIME_UPDATE)