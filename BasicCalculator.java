import java.util.Deque;
import java.util.LinkedList;

public class BasicCalculator {

    public int calculate(String s) {
        // 双栈：结果栈、符号栈
        Deque<Integer> numStack = new LinkedList<>();
        Deque<Integer> opStack = new LinkedList<>();
        
        int res = 0;    // 当前括号内累加结果
        int sign = 1;   // 当前正负号：1正 -1负
        int n = s.length();

        for (int i = 0; i < n; i++) {
            char c = s.charAt(i);

            // 1. 处理多位数字
            if (Character.isDigit(c)) {
                int num = 0;
                while (i < n && Character.isDigit(s.charAt(i))) {
                    num = num * 10 + (s.charAt(i) - '0');
                    i++;
                }
                i--; // 回退一格，避免跳过字符
                res += sign * num;
            }
            // 2. 加号：更新符号
            else if (c == '+') {
                sign = 1;
            }
            // 3. 减号：更新符号
            else if (c == '-') {
                sign = -1;
            }
            // 4. 左括号：压栈保存当前结果+符号，重置现场
            else if (c == '(') {
                numStack.push(res);
                opStack.push(sign);
                res = 0;
                sign = 1;
            }
            // 5. 右括号：括号内算完，和外层合并
            else if (c == ')') {
                res = numStack.pop() + opStack.pop() * res;
            }
            // 空格：直接跳过
        }
        return res;
    }

    // 测试
    // public static void main(String[] args) {
    //     BasicCalculator cal = new BasicCalculator();
    //     // 用例1
    //     System.out.println(cal.calculate("1 + 1"));          // 2
    //     // 用例2
    //     System.out.println(cal.calculate(" 2-1 + 2 "));      // 3
    //     // 用例3 经典括号
    //     System.out.println(cal.calculate("(1+(4+5+2)-3)+(6+8)")); //23
    // }
}