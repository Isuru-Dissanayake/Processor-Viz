Assembly= {0: 'RST ALL',
1: 'LOAD 0 R1',
2: 'LOAD 1 R2',
3: 'LOAD 2 R6',
4: 'LOAD 3 R3',
5: 'SUB R3 I',
6: 'MUL R1 R2',
7: 'ROOF AC R3',
8: 'MOV AC R14',
9: 'ADDONE R13',
10: 'MOV AC R13',
11: 'MUL R13 I',
12: 'MOV AC R7',
13: 'MUL R1 R2',
14: 'SUB AC R7',
15: 'MUL R13 R3',
16: 'ADD AC I',
17: 'MOV AC R4',
18: 'SUBONE AC',
19: 'MOD AC R1',
20: 'MOV AC R5',
21: 'FLR R4 R1',
22: 'MOV AC R4',
23: 'MUL R6 R4',
24: 'LOAD 4 R7',
25: 'LOAD 5 R8',
26: 'LOAD 6 R9',
27: 'ADD AC R7',
28: 'MOV AC R7',
29: 'ADD R8 R5',
30: 'MOV AC R8',
31: 'MUL R1 R4',
32: 'ADD AC R5',
33: 'ADD AC R9',
34: 'MOV AC R9',
35: 'LOADR R7 R10',
36: 'LOADR R8 R11',
37: 'MUL R10 R11',
38: 'ADD AC TO',
39: 'MOV AC TO',
40: 'ADDONE R7',
41: 'MOV AC R7',
42: 'ADD R8 R1',
43: 'MOV AC R8',
44: 'ADDONE R12',
45: 'MOV AC R12',
46: 'SUB R6 R12',
47: 'JUMPNZ 36',
48: 'STORE R9 TO',
49: 'RST TO',
50: 'ADDONE R13',
51: 'MOV AC R13',
52: 'SUB R14 R13',
53: 'JMPNZ 12'}


#size of the first matrix= n*m
#size of the second matrix= m*l
#size of the output matrix= n*l
#number of used cores= y

n= 2
m= 2
l= 2
y= 16

alpha1= 7
alpha2= 7+ n*m
alpha3= alpha2+ m*l

A= [[1,2],
    [3,4]]

B= [[1,2],
    [3,4]]

f= open(str(n)+'x'+str(l)+'.txt',"w+")
for i in range(54):
    #if i== 22:
    #    f.write(str(i)+' LOADR '+str(alpha1)+' R7\n')
    #elif i== 23:
    #    f.write(str(i)+' LDI '+str(alpha2)+' R8\n')
    #elif i== 24:
    #    f.write(str(i)+' LDI '+str(alpha3)+' R9\n')
    #else:
        
    #f.write(str(i)+' '+Assembly[i]+'\n')
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
