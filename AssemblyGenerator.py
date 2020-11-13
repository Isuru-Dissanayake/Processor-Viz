Assembly= {0: 'RST ALL',
1: 'LOAD 0 R1',
2: 'LOAD 1 R2',
3: 'LOAD 2 R6',
4: 'LOAD 3 R3',
5: 'SUB R3 I',
6: 'MUL R1 R2',
7: 'ROOF AC R3',
8: 'MOV AC R14',
9: 'MUL R13 R3',
10: 'ADD AC I',
11: 'MOV AC R7',
12: 'MUL R1 R2',
13: 'SUB AC R7',
14: 'SUBONE R7',
15: 'MOV AC R4',
16: 'MOD AC R1',
17: 'MOV AC R5',
18: 'FLR R4 R1',
19: 'MOV AC R4',
20: 'MUL R6 R4',
21: 'LOAD 4 R7',
22: 'LOAD 5 R8',
23: 'LOAD 6 R9',
24: 'ADD AC R7',
25: 'MOV AC R7',
26: 'ADD R8 R5',
27: 'MOV AC R8',
28: 'MUL R1 R4',
29: 'ADD AC R5',
30: 'ADD AC R9',
31: 'MOV AC R9',
32: 'LOADR R7 R10',
33: 'LOADR R8 R11',
34: 'MUL R10 R11',
35: 'ADD AC TO',
36: 'MOV AC TO',
37: 'ADDONE R7',
38: 'MOV AC R7',
39: 'ADD R8 R1',
40: 'MOV AC R8',
41: 'ADDONE R12',
42: 'MOV AC R12',
43: 'SUB R6 R12',
44: 'JMPNZ 32',
45: 'STORE R9 TO',
46: 'RST R12',
47: 'RST TO',
48: 'ADDONE R13',
49: 'MOV AC R13',
50: 'SUB R14 R13',
51: 'JMPNZ 9'}


#size of the first matrix= n*m
#size of the second matrix= m*l
#size of the output matrix= n*l
#number of used cores= y

n= 4
m= 4
l= 4
y= 1

alpha1= 7
alpha2= 7+ n*m
alpha3= alpha2+ m*l

A= [[1,2,3,4],
    [1,2,3,4],
    [1,2,3,4],
    [1,2,3,4]]

B= [[1,2,3,4],
    [1,2,3,4],
    [1,2,3,4],
    [1,2,3,4]]

f= open(str(n)+'x'+str(l)+'.txt',"w+")
for i in range(52):
    #if i== 22:
    #    f.write(str(i)+' LOADR '+str(alpha1)+' R7\n')
    #elif i== 23:
    #    f.write(str(i)+' LDI '+str(alpha2)+' R8\n')
    #elif i== 24:
    #    f.write(str(i)+' LDI '+str(alpha3)+' R9\n')
    #else:
        
    f.write(Assembly[i]+'\n')

f.close() 

f= open(str(n)+'x'+str(l)+'_data.txt',"w+")
f.write(str(l)+'\n')
f.write(str(n)+'\n')
f.write(str(m)+'\n')
f.write(str(y)+'\n')
f.write(str(alpha1)+'\n')
f.write(str(alpha2)+'\n')
f.write(str(alpha3)+'\n')
for i in range(len(A)):
    for j in range(len(A[i])):
        f.write(str(A[i][j])+'\n')
for i in range(len(B)):
    for j in range(len(B[i])):
        f.write(str(B[i][j])+'\n')
f.close() 
