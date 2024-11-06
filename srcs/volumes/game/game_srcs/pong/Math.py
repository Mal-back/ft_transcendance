from .Coord import Coordinates, Direction
from attrs import define, field, validators
import math

@define
class Circle:
    position : Coordinates = field(validator=validators.instance_of(Coordinates))
    radius: int = field(validator=validators.instance_of(int))


def CollisionCirclePoint(point : Coordinates, circle : Circle) -> bool:
    d2 =  pow(point.x - circle.position.x, 2) + pow(point.y - circle.position.y, 2)
    if d2 > pow(circle.radius, 2):
        return False
    else:
        return True


def CollisionCircleLine(A : Coordinates, B : Coordinates, circle : Circle) -> bool:
    u = Direction(B.x - A.x, B.y - A.y)
    AC = Direction(circle.position.x - A.x, circle.position.y - A.y)
    num = abs(u.dx * AC.dy - u.dy * AC.dx)
    den = math.sqrt(u.dx * u.dx + u.dy * u.dy)
    if den == 0:
        return False
    CI = num / den
    if (CI < circle.radius):
        return True
    else:
        return False


def CollisionCircleSegment(A : Coordinates, B : Coordinates, circle : Circle) -> bool:
    if CollisionCircleLine(A, B, circle) == False:
        return False
    pscal1 = (B.x - A.x) * (circle.position.x - A.x) + (B.y - A.y) * (circle.position.y - A.y)
    pscal2 = (A.x - B.x) * (circle.position.x - B.x) + (A.y - B.y) * (circle.position.y - B.y)
    if pscal1 >= 0 and pscal2 >= 0:
        return True
    elif CollisionCirclePoint(A,circle) == True:
        return True
    elif CollisionCirclePoint(B,circle) == True:
        return True
    return False


def ImpactProjection(A : Coordinates, B : Coordinates, C : Coordinates) -> Coordinates:
    u = Direction(B.x - A.x, B.y - A.y)
    AC = Direction(C.x - A.x, C.y - A.y)
    try:
        ti = (u.dx * AC.dx + u.dy * AC.dy) / (u.dx * u.dx + u.dy * u.dy)
    except ZeroDivisionError:
        print("ImpactProjection : exception caught ZeroDivisionError")
        ti = 1000000000
    return Coordinates(int(A.x + ti * u.dx), int(A.y + ti * u.dy))


def GetNormal(A : Coordinates, B : Coordinates, C : Coordinates) -> Direction:
    u = Direction(B.x - A.x, B.y - A.y)
    AC = Direction(C.x - A.x, C.y - A.y)
    step = u.dx * AC.dy - u.dy * AC.dx
    N = Direction(-u.dy * step, u.dx * step)
    norme = math.sqrt(N.dx * N.dx + N.dy * N.dy)
    try:
        return Direction(int(N.dx / norme), int(N.dy / norme))
    except ZeroDivisionError:
        print("GetNormal : exception caught ZeroDivisionError")
        return Direction(1000000000, 1000000000)
        

def GetBounceDir(v : Direction, N : Direction) -> Direction:
    pscal = v.dx * N.dx + v.dy * N.dy
    bounce_dir =  Direction(int(v.dx - 2 * pscal * N.dx), int(v.dy - 2 * pscal * N.dy))
    return bounce_dir
