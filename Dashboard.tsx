import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { 
  Sparkles, 
  TrendingUp, 
  BookOpen, 
  MessageSquare, 
  User, 
  LogOut, 
  PlayCircle,
  Code,
  Trophy,
  Clock,
  ExternalLink,
  Youtube,
  Brain,
  Target,
  BarChart3,
  Calendar,
  Code2,
  FileText,
  CheckCircle2,
  Plus,
  Users,
  Trash2,
  Edit,
  Star,
  Award,
  Zap,
  Flame,
  Puzzle,
  Cpu,
  Database,
  Globe,
  Smartphone,
  GitBranch,
  Cloud,
  Lock,
  Unlock,
  Video,
  FileVideo,
  ListVideo,
  CalendarDays,
  TargetIcon,
  Bot,
  Send,
  Mic,
  MicOff,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  X
} from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  // Real data state
  const [userStats, setUserStats] = useState({
    videosWatched: 0,
    problemsSolved: 0,
    currentStreak: 0,
    weeklyGoal: 0,
    totalCourses: 0,
    completedCourses: 0,
    achievements: 0
  });

  const [learningVideos, setLearningVideos] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [courseVideos, setCourseVideos] = useState<any[]>([]);
  const [dailyChallenges, setDailyChallenges] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);

  // Course management states
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: '',
    duration_hours: null as number | null,
    thumbnail_url: '',
    is_trending: false
  });

  // Video management states
  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    url: '',
    duration: '',
    course_id: '',
    order_index: 0,
    thumbnail_url: ''
  });

  // Challenge management states
  const [challengeForm, setChallengeForm] = useState({
    title: '',
    description: '',
    difficulty: 'beginner',
    problem_statement: '',
    test_cases: '',
    solution_template: '',
    category: 'programming'
  });

  // AI Chatbot states
  const [chatMessages, setChatMessages] = useState<Array<{role: string, content: string, timestamp: Date}>>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Career Path states
  const [selectedCareerPath, setSelectedCareerPath] = useState<string | null>(null);

  // Quiz states
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);

  // Speech recognition
  const [recognition, setRecognition] = useState<any>(null);

  // Programming Languages for Quiz
  const programmingLanguages = [
    { id: "c", name: "C Programming", icon: <Code className="w-6 h-6" /> },
    { id: "cpp", name: "C++", icon: <Cpu className="w-6 h-6" /> },
    { id: "java", name: "Java", icon: <Coffee className="w-6 h-6" /> },
    { id: "python", name: "Python", icon: <FileText className="w-6 h-6" /> },
    { id: "javascript", name: "JavaScript", icon: <Globe className="w-6 h-6" /> },
    { id: "typescript", name: "TypeScript", icon: <Code2 className="w-6 h-6" /> },
    { id: "go", name: "Go", icon: <GitBranch className="w-6 h-6" /> },
    { id: "rust", name: "Rust", icon: <Zap className="w-6 h-6" /> },
    { id: "swift", name: "Swift", icon: <Smartphone className="w-6 h-6" /> },
    { id: "kotlin", name: "Kotlin", icon: <Android className="w-6 h-6" /> },
    { id: "php", name: "PHP", icon: <Server className="w-6 h-6" /> },
    { id: "ruby", name: "Ruby", icon: <Gem className="w-6 h-6" /> },
    { id: "csharp", name: "C#", icon: <Code className="w-6 h-6" /> },
    { id: "sql", name: "SQL", icon: <Database className="w-6 h-6" /> },
    { id: "html", name: "HTML/CSS", icon: <Layout className="w-6 h-6" /> }
  ];

  // Quiz Questions Database
  const quizDatabase = {
    c: [
      {
        question: "What is the correct way to declare a pointer in C?",
        options: [
          "int ptr*;",
          "int *ptr;",
          "pointer int ptr;",
          "int pointer ptr;"
        ],
        correctAnswer: 1,
        explanation: "In C, pointers are declared using the asterisk (*) symbol before the variable name."
      },
      {
        question: "Which function is used to allocate memory dynamically in C?",
        options: [
          "malloc()",
          "alloc()",
          "new()",
          "create()"
        ],
        correctAnswer: 0,
        explanation: "malloc() is used for dynamic memory allocation in C."
      },
      {
        question: "What is the output of: printf('%d', 5 == 5);",
        options: [
          "5",
          "1",
          "true",
          "0"
        ],
        correctAnswer: 1,
        explanation: "In C, boolean expressions return 1 for true and 0 for false."
      },
      {
        question: "Which header file is required for input/output operations?",
        options: [
          "<input.h>",
          "<stdio.h>",
          "<io.h>",
          "<console.h>"
        ],
        correctAnswer: 1,
        explanation: "<stdio.h> contains standard input/output functions."
      },
      {
        question: "What does the 'void' keyword indicate in a function declaration?",
        options: [
          "The function returns no value",
          "The function takes no parameters",
          "The function is empty",
          "The function is virtual"
        ],
        correctAnswer: 0,
        explanation: "void indicates that the function doesn't return any value."
      },
      {
        question: "Which operator is used to get the address of a variable?",
        options: [
          "*",
          "&",
          "#",
          "@"
        ],
        correctAnswer: 1,
        explanation: "The & operator returns the memory address of a variable."
      },
      {
        question: "What is the size of an integer in C typically?",
        options: [
          "2 bytes",
          "4 bytes",
          "8 bytes",
          "Depends on the system"
        ],
        correctAnswer: 3,
        explanation: "The size of int depends on the system architecture (usually 4 bytes on 32-bit, 8 bytes on 64-bit)."
      },
      {
        question: "Which loop is guaranteed to execute at least once?",
        options: [
          "for loop",
          "while loop",
          "do-while loop",
          "if-else statement"
        ],
        correctAnswer: 2,
        explanation: "do-while loop checks the condition after executing the block, so it always runs at least once."
      },
      {
        question: "What is a structure in C?",
        options: [
          "A function that structures code",
          "A collection of related variables",
          "A type of loop",
          "A memory allocation method"
        ],
        correctAnswer: 1,
        explanation: "A structure is a user-defined data type that groups related variables."
      },
      {
        question: "Which keyword is used to define a constant in C?",
        options: [
          "constant",
          "define",
          "const",
          "final"
        ],
        correctAnswer: 2,
        explanation: "The 'const' keyword is used to define read-only variables."
      },
      {
        question: "What is the purpose of the 'break' statement?",
        options: [
          "To terminate the program",
          "To exit a loop or switch statement",
          "To skip the current iteration",
          "To pause execution"
        ],
        correctAnswer: 1,
        explanation: "break is used to exit loops and switch statements."
      },
      {
        question: "Which function reads a string from standard input?",
        options: [
          "scanf()",
          "gets()",
          "fgets()",
          "All of the above"
        ],
        correctAnswer: 3,
        explanation: "All these functions can read strings, but fgets() is safer than gets()."
      },
      {
        question: "What is recursion in C?",
        options: [
          "A function calling another function",
          "A function calling itself",
          "A type of loop",
          "A memory management technique"
        ],
        correctAnswer: 1,
        explanation: "Recursion occurs when a function calls itself directly or indirectly."
      },
      {
        question: "Which operator has the highest precedence?",
        options: [
          "&&",
          "||",
          "==",
          "()"
        ],
        correctAnswer: 3,
        explanation: "Parentheses have the highest precedence in C."
      },
      {
        question: "What is a file pointer?",
        options: [
          "A pointer to a file stream",
          "A pointer to a file name",
          "A pointer to file content",
          "A special type of integer"
        ],
        correctAnswer: 0,
        explanation: "A file pointer points to a FILE stream for file operations."
      },
      {
        question: "Which header file contains mathematical functions?",
        options: [
          "<math.h>",
          "<calc.h>",
          "<numbers.h>",
          "<functions.h>"
        ],
        correctAnswer: 0,
        explanation: "<math.h> contains mathematical functions like sin(), cos(), sqrt(), etc."
      },
      {
        question: "What is the purpose of the 'static' keyword?",
        options: [
          "To make a variable constant",
          "To preserve variable value between function calls",
          "To make a variable global",
          "To speed up variable access"
        ],
        correctAnswer: 1,
        explanation: "static preserves the value of local variables between function calls."
      },
      {
        question: "Which data type is used for storing single characters?",
        options: [
          "string",
          "char",
          "character",
          "text"
        ],
        correctAnswer: 1,
        explanation: "char is used for storing single characters."
      },
      {
        question: "What is the ternary operator in C?",
        options: [
          "?:",
          "??",
          "::",
          "->"
        ],
        correctAnswer: 0,
        explanation: "?: is the ternary operator for conditional expressions."
      },
      {
        question: "Which function is used to close a file?",
        options: [
          "fclose()",
          "close()",
          "endfile()",
          "shutdown()"
        ],
        correctAnswer: 0,
        explanation: "fclose() is used to close an open file stream."
      },
      {
        question: "What is a pointer to a function?",
        options: [
          "A pointer that points to function code",
          "A pointer that stores function return value",
          "A pointer to function parameters",
          "A special type of array"
        ],
        correctAnswer: 0,
        explanation: "Function pointers store addresses of functions."
      },
      {
        question: "Which operator is used for pointer dereferencing?",
        options: [
          "&",
          "*",
          "->",
          "."
        ],
        correctAnswer: 1,
        explanation: "* is used to dereference pointers and access the value they point to."
      },
      {
        question: "What is the purpose of the 'typedef' keyword?",
        options: [
          "To define new data types",
          "To type check variables",
          "To create type aliases",
          "To define function types"
        ],
        correctAnswer: 2,
        explanation: "typedef is used to create aliases for existing data types."
      },
      {
        question: "Which function copies one string to another?",
        options: [
          "strcopy()",
          "strcpy()",
          "copy()",
          "stringcpy()"
        ],
        correctAnswer: 1,
        explanation: "strcpy() is used to copy strings in C."
      },
      {
        question: "What is the scope of a global variable?",
        options: [
          "Only within the function it's declared",
          "Throughout the entire program",
          "Only within the file it's declared",
          "Only within the current block"
        ],
        correctAnswer: 1,
        explanation: "Global variables are accessible throughout the entire program."
      },
      {
        question: "Which operator is used for member access via pointer?",
        options: [
          ".",
          "->",
          "::",
          "*"
        ],
        correctAnswer: 1,
        explanation: "-> is used to access structure members through pointers."
      },
      {
        question: "What is command line argument in C?",
        options: [
          "Arguments passed to main() function",
          "Arguments for command execution",
          "Terminal commands",
          "Compiler arguments"
        ],
        correctAnswer: 0,
        explanation: "Command line arguments are passed to the main() function as parameters."
      },
      {
        question: "Which function compares two strings?",
        options: [
          "strcmp()",
          "compare()",
          "strcompare()",
          "stringcmp()"
        ],
        correctAnswer: 0,
        explanation: "strcmp() is used to compare two strings lexicographically."
      },
      {
        question: "What is a union in C?",
        options: [
          "A collection of different data types sharing same memory",
          "A combination of structures",
          "A type of function",
          "A memory management technique"
        ],
        correctAnswer: 0,
        explanation: "A union allows storing different data types in the same memory location."
      },
      {
        question: "Which header file is for memory management functions?",
        options: [
          "<memory.h>",
          "<stdlib.h>",
          "<malloc.h>",
          "Both 1 and 2"
        ],
        correctAnswer: 3,
        explanation: "Both <stdlib.h> and <memory.h> contain memory management functions."
      }
    ],
    cpp: [
      {
        question: "What is the main feature of C++ that C doesn't have?",
        options: [
          "Pointers",
          "Structures",
          "Object-Oriented Programming",
          "Functions"
        ],
        correctAnswer: 2,
        explanation: "C++ supports OOP features like classes, inheritance, and polymorphism."
      },
      {
        question: "Which operator is used for dynamic memory allocation in C++?",
        options: [
          "malloc",
          "alloc",
          "new",
          "create"
        ],
        correctAnswer: 2,
        explanation: "The 'new' operator is used for dynamic memory allocation in C++."
      },
      {
        question: "What is function overloading?",
        options: [
          "Functions with same name but different parameters",
          "Functions that are too long",
          "Functions that call themselves",
          "Functions that override base class functions"
        ],
        correctAnswer: 0,
        explanation: "Function overloading allows multiple functions with same name but different parameters."
      },
      {
        question: "Which access specifier makes members accessible only within the class?",
        options: [
          "public",
          "private",
          "protected",
          "internal"
        ],
        correctAnswer: 1,
        explanation: "private members are accessible only within the class."
      },
      {
        question: "What is a constructor?",
        options: [
          "A function that destroys objects",
          "A function that constructs objects",
          "A special member function for initialization",
          "A function that copies objects"
        ],
        correctAnswer: 2,
        explanation: "Constructors are special member functions that initialize objects."
      },
      {
        question: "Which keyword is used for inheritance?",
        options: [
          "inherits",
          "extends",
          "implements",
          ":"
        ],
        correctAnswer: 3,
        explanation: "In C++, inheritance is specified using a colon (:)."
      },
      {
        question: "What is polymorphism?",
        options: [
          "Multiple functions with same name",
          "Ability to take many forms",
          "Function overriding",
          "All of the above"
        ],
        correctAnswer: 3,
        explanation: "Polymorphism includes function overloading, overriding, and virtual functions."
      },
      {
        question: "Which STL container provides dynamic arrays?",
        options: [
          "vector",
          "list",
          "map",
          "set"
        ],
        correctAnswer: 0,
        explanation: "vector provides dynamic array functionality."
      },
      {
        question: "What is the 'this' pointer?",
        options: [
          "Pointer to current object",
          "Pointer to base class",
          "Pointer to derived class",
          "Pointer to function"
        ],
        correctAnswer: 0,
        explanation: "'this' is a pointer to the current object instance."
      },
      {
        question: "Which operator cannot be overloaded?",
        options: [
          "+",
          "==",
          "::",
          "<<"
        ],
        correctAnswer: 2,
        explanation: "The scope resolution operator (::) cannot be overloaded."
      },
      {
        question: "What is a virtual function?",
        options: [
          "A function that doesn't exist",
          "A function that can be overridden",
          "A function with no implementation",
          "A static function"
        ],
        correctAnswer: 1,
        explanation: "Virtual functions can be overridden in derived classes."
      },
      {
        question: "Which header file is for I/O streams?",
        options: [
          "<iostream>",
          "<stdio.h>",
          "<stream>",
          "<io>"
        ],
        correctAnswer: 0,
        explanation: "<iostream> contains standard input/output stream objects."
      },
      {
        question: "What is exception handling in C++?",
        options: [
          "try-catch blocks",
          "error() function",
          "exception() class",
          "All of the above"
        ],
        correctAnswer: 0,
        explanation: "try-catch blocks are used for exception handling."
      },
      {
        question: "Which keyword is used for function templates?",
        options: [
          "template",
          "generic",
          "type",
          "var"
        ],
        correctAnswer: 0,
        explanation: "template keyword is used to define function templates."
      },
      {
        question: "What is a destructor?",
        options: [
          "A function that initializes objects",
          "A function that cleans up resources",
          "A function that copies objects",
          "A function that compares objects"
        ],
        correctAnswer: 1,
        explanation: "Destructors clean up resources when objects are destroyed."
      },
      {
        question: "Which operator is used for namespace?",
        options: [
          "::",
          ":",
          ".",
          "->"
        ],
        correctAnswer: 0,
        explanation: ":: is the scope resolution operator for namespaces."
      },
      {
        question: "What is the difference between struct and class in C++?",
        options: [
          "No difference",
          "Struct members are public by default",
          "Class members are private by default",
          "Both 2 and 3"
        ],
        correctAnswer: 3,
        explanation: "Struct has public members by default, class has private."
      },
      {
        question: "Which STL container uses key-value pairs?",
        options: [
          "vector",
          "list",
          "map",
          "queue"
        ],
        correctAnswer: 2,
        explanation: "map stores key-value pairs."
      },
      {
        question: "What is function overriding?",
        options: [
          "Same function in different classes",
          "Redefining base class function in derived class",
          "Multiple functions with same name",
          "Functions that are virtual"
        ],
        correctAnswer: 1,
        explanation: "Function overriding redefines a base class function in derived class."
      },
      {
        question: "Which keyword prevents inheritance?",
        options: [
          "static",
          "final",
          "sealed",
          "private"
        ],
        correctAnswer: 1,
        explanation: "final keyword prevents further inheritance."
      },
      {
        question: "What is RAII in C++?",
        options: [
          "Resource Allocation Is Initialization",
          "Random Access Iterator Interface",
          "Runtime Allocation Information",
          "Resource Access Implementation"
        ],
        correctAnswer: 0,
        explanation: "RAII ties resource management to object lifetime."
      },
      {
        question: "Which operator is used for smart pointers?",
        options: [
          "auto_ptr",
          "unique_ptr",
          "shared_ptr",
          "All of the above"
        ],
        correctAnswer: 3,
        explanation: "C++ has multiple smart pointer types."
      },
      {
        question: "What is a lambda function?",
        options: [
          "Anonymous function",
          "Function pointer",
          "Virtual function",
          "Static function"
        ],
        correctAnswer: 0,
        explanation: "Lambda functions are anonymous functions."
      },
      {
        question: "Which header file is for algorithms?",
        options: [
          "<algorithm>",
          "<math>",
          "<function>",
          "<util>"
        ],
        correctAnswer: 0,
        explanation: "<algorithm> contains STL algorithms like sort, find, etc."
      },
      {
        question: "What is move semantics?",
        options: [
          "Moving objects between memory locations",
          "Efficient transfer of resources",
          "Both 1 and 2",
          "None of the above"
        ],
        correctAnswer: 2,
        explanation: "Move semantics enable efficient resource transfer."
      },
      {
        question: "Which keyword is used for constant expressions?",
        options: [
          "const",
          "constexpr",
          "static",
          "final"
        ],
        correctAnswer: 1,
        explanation: "constexpr indicates constant expressions evaluated at compile time."
      },
      {
        question: "What is a friend function?",
        options: [
          "Function that can access private members",
          "Function that is friendly",
          "Virtual function",
          "Static function"
        ],
        correctAnswer: 0,
        explanation: "Friend functions can access private and protected members."
      },
      {
        question: "Which operator is used for type identification?",
        options: [
          "typeof",
          "typeid",
          "typename",
          "typespec"
        ],
        correctAnswer: 1,
        explanation: "typeid operator returns type information."
      },
      {
        question: "What is multiple inheritance?",
        options: [
          "Inheriting from multiple base classes",
          "Multiple levels of inheritance",
          "Inheritance with multiple methods",
          "All of the above"
        ],
        correctAnswer: 0,
        explanation: "Multiple inheritance allows a class to inherit from multiple base classes."
      },
      {
        question: "Which STL container is FIFO?",
        options: [
          "stack",
          "queue",
          "deque",
          "vector"
        ],
        correctAnswer: 1,
        explanation: "queue follows First-In-First-Out (FIFO) principle."
      }
    ],
    java: [
      {
        question: "What is the main principle of Java?",
        options: [
          "Write Once, Run Anywhere",
          "Fast Execution",
          "Low Memory Usage",
          "Easy Syntax"
        ],
        correctAnswer: 0,
        explanation: "Java's main principle is platform independence - Write Once, Run Anywhere."
      },
      {
        question: "Which keyword is used for inheritance in Java?",
        options: [
          "inherits",
          "extends",
          "implements",
          "super"
        ],
        correctAnswer: 1,
        explanation: "extends keyword is used for class inheritance in Java."
      },
      {
        question: "What is JVM?",
        options: [
          "Java Virtual Machine",
          "Java Variable Manager",
          "Java Version Manager",
          "Java Visual Monitor"
        ],
        correctAnswer: 0,
        explanation: "JVM stands for Java Virtual Machine."
      },
      {
        question: "Which method is the entry point of a Java application?",
        options: [
          "start()",
          "main()",
          "execute()",
          "run()"
        ],
        correctAnswer: 1,
        explanation: "main() method is the entry point of Java applications."
      },
      {
        question: "What is the default value of boolean in Java?",
        options: [
          "true",
          "false",
          "null",
          "0"
        ],
        correctAnswer: 1,
        explanation: "boolean default value is false."
      },
      {
        question: "Which keyword is used to create an object?",
        options: [
          "create",
          "new",
          "object",
          "allocate"
        ],
        correctAnswer: 1,
        explanation: "new keyword is used to create objects in Java."
      },
      {
        question: "What is method overriding?",
        options: [
          "Same method in same class",
          "Different method with same name",
          "Redefining parent class method",
          "All of the above"
        ],
        correctAnswer: 2,
        explanation: "Method overriding redefines a method from parent class."
      },
      {
        question: "Which collection class is synchronized?",
        options: [
          "ArrayList",
          "HashMap",
          "Vector",
          "LinkedList"
        ],
        correctAnswer: 2,
        explanation: "Vector is synchronized and thread-safe."
      },
      {
        question: "What is the superclass of all classes in Java?",
        options: [
          "Object",
          "Class",
          "Main",
          "Root"
        ],
        correctAnswer: 0,
        explanation: "Object class is the superclass of all Java classes."
      },
      {
        question: "Which keyword is used for method hiding?",
        options: [
          "static",
          "final",
          "private",
          "protected"
        ],
        correctAnswer: 0,
        explanation: "static methods are hidden, not overridden."
      },
      {
        question: "What is an interface?",
        options: [
          "Abstract class",
          "Collection of abstract methods",
          "Class with implementation",
          "All of the above"
        ],
        correctAnswer: 1,
        explanation: "Interface contains abstract method declarations."
      },
      {
        question: "Which exception is checked?",
        options: [
          "RuntimeException",
          "IOException",
          "NullPointerException",
          "ArrayIndexOutOfBoundsException"
        ],
        correctAnswer: 1,
        explanation: "IOException is a checked exception."
      },
      {
        question: "What is garbage collection?",
        options: [
          "Manual memory management",
          "Automatic memory management",
          "Memory allocation",
          "Memory deallocation"
        ],
        correctAnswer: 1,
        explanation: "Garbage collection automatically manages memory."
      },
      {
        question: "Which method is used for string comparison?",
        options: [
          "equals()",
          "compare()",
          "==",
          "match()"
        ],
        correctAnswer: 0,
        explanation: "equals() method compares string contents."
      },
      {
        question: "What is a package in Java?",
        options: [
          "Collection of classes",
          "Java archive file",
          "Compilation unit",
          "All of the above"
        ],
        correctAnswer: 0,
        explanation: "Package is a collection of related classes."
      },
      {
        question: "Which keyword prevents method overriding?",
        options: [
          "static",
          "final",
          "private",
          "sealed"
        ],
        correctAnswer: 1,
        explanation: "final methods cannot be overridden."
      },
      {
        question: "What is multithreading?",
        options: [
          "Multiple processes",
          "Multiple threads in one process",
          "Multiple applications",
          "Multiple CPUs"
        ],
        correctAnswer: 1,
        explanation: "Multithreading allows multiple threads in one process."
      },
      {
        question: "Which collection maintains insertion order?",
        options: [
          "HashSet",
          "TreeSet",
          "LinkedHashSet",
          "All of the above"
        ],
        correctAnswer: 2,
        explanation: "LinkedHashSet maintains insertion order."
      },
      {
        question: "What is constructor chaining?",
        options: [
          "Multiple constructors in one class",
          "Calling one constructor from another",
          "Inheriting constructors",
          "All of the above"
        ],
        correctAnswer: 1,
        explanation: "Constructor chaining calls one constructor from another."
      },
      {
        question: "Which keyword is used for synchronization?",
        options: [
          "sync",
          "synchronized",
          "lock",
          "threadsafe"
        ],
        correctAnswer: 1,
        explanation: "synchronized keyword provides thread safety."
      },
      {
        question: "What is autoboxing?",
        options: [
          "Automatic conversion to objects",
          "Boxing classes",
          "Wrapper classes",
          "All of the above"
        ],
        correctAnswer: 0,
        explanation: "Autoboxing converts primitives to wrapper objects automatically."
      },
      {
        question: "Which method is called during object creation?",
        options: [
          "finalize()",
          "constructor",
          "main()",
          "init()"
        ],
        correctAnswer: 1,
        explanation: "Constructor is called during object creation."
      },
      {
        question: "What is the size of int in Java?",
        options: [
          "2 bytes",
          "4 bytes",
          "8 bytes",
          "Platform dependent"
        ],
        correctAnswer: 1,
        explanation: "int is always 4 bytes in Java."
      },
      {
        question: "Which collection doesn't allow duplicates?",
        options: [
          "List",
          "Set",
          "Map",
          "Queue"
        ],
        correctAnswer: 1,
        explanation: "Set doesn't allow duplicate elements."
      },
      {
        question: "What is method overloading?",
        options: [
          "Same method different parameters",
          "Same method same parameters",
          "Different methods",
          "All of the above"
        ],
        correctAnswer: 0,
        explanation: "Method overloading: same name, different parameters."
      },
      {
        question: "Which keyword is used for abstract classes?",
        options: [
          "abstract",
          "virtual",
          "interface",
          "extends"
        ],
        correctAnswer: 0,
        explanation: "abstract keyword defines abstract classes."
      },
      {
        question: "What is try-with-resources?",
        options: [
          "Exception handling",
          "Automatic resource management",
          "Resource allocation",
          "All of the above"
        ],
        correctAnswer: 1,
        explanation: "try-with-resources automatically closes resources."
      },
      {
        question: "Which method is used for array sorting?",
        options: [
          "Arrays.sort()",
          "Array.sort()",
          "sort()",
          "Collections.sort()"
        ],
        correctAnswer: 0,
        explanation: "Arrays.sort() sorts arrays."
      },
      {
        question: "What is a static variable?",
        options: [
          "Class-level variable",
          "Instance variable",
          "Local variable",
          "Constant variable"
        ],
        correctAnswer: 0,
        explanation: "Static variables belong to the class, not instances."
      },
      {
        question: "Which interface is for sorting?",
        options: [
          "Runnable",
          "Comparable",
          "Serializable",
          "Cloneable"
        ],
        correctAnswer: 1,
        explanation: "Comparable interface provides natural ordering."
      }
    ],
    python: [
      {
        question: "What is Python?",
        options: [
          "Compiled language",
          "Interpreted language",
          "Assembly language",
          "Machine language"
        ],
        correctAnswer: 1,
        explanation: "Python is an interpreted language."
      },
      {
        question: "Which data type is mutable in Python?",
        options: [
          "tuple",
          "string",
          "list",
          "int"
        ],
        correctAnswer: 2,
        explanation: "Lists are mutable in Python."
      },
      {
        question: "What is list comprehension?",
        options: [
          "Creating lists",
          "Concise way to create lists",
          "List operations",
          "All of the above"
        ],
        correctAnswer: 1,
        explanation: "List comprehension provides concise list creation."
      },
      {
        question: "Which keyword is used for functions?",
        options: [
          "function",
          "def",
          "func",
          "define"
        ],
        correctAnswer: 1,
        explanation: "def keyword defines functions in Python."
      },
      {
        question: "What is PEP 8?",
        options: [
          "Python enhancement proposal",
          "Style guide",
          "Coding conventions",
          "All of the above"
        ],
        correctAnswer: 3,
        explanation: "PEP 8 is Python's style guide."
      },
      {
        question: "Which module is for regular expressions?",
        options: [
          "regex",
          "re",
          "pattern",
          "string"
        ],
        correctAnswer: 1,
        explanation: "re module handles regular expressions."
      },
      {
        question: "What is a dictionary?",
        options: [
          "Key-value pairs",
          "Ordered collection",
          "Mutable sequence",
          "All of the above"
        ],
        correctAnswer: 0,
        explanation: "Dictionary stores key-value pairs."
      },
      {
        question: "Which method is used to read files?",
        options: [
          "read()",
          "open()",
          "readline()",
          "All of the above"
        ],
        correctAnswer: 3,
        explanation: "All these methods are used for file reading."
      },
      {
        question: "What is __init__ method?",
        options: [
          "Constructor",
          "Initializer",
          "Both 1 and 2",
          "Destructor"
        ],
        correctAnswer: 2,
        explanation: "__init__ is the constructor/initializer method."
      },
      {
        question: "Which operator is for exponentiation?",
        options: [
          "^",
          "**",
          "^^",
          "exp"
        ],
        correctAnswer: 1,
        explanation: "** is the exponentiation operator."
      },
      {
        question: "What is a generator?",
        options: [
          "Function with yield",
          "Iterator",
          "Memory efficient",
          "All of the above"
        ],
        correctAnswer: 3,
        explanation: "Generators use yield and are memory efficient iterators."
      },
      {
        question: "Which module is for HTTP requests?",
        options: [
          "http",
          "requests",
          "urllib",
          "All of the above"
        ],
        correctAnswer: 3,
        explanation: "All these modules handle HTTP requests."
      },
      {
        question: "What is slicing?",
        options: [
          "Extracting parts of sequences",
          "Cutting strings",
          "List operations",
          "All of the above"
        ],
        correctAnswer: 0,
        explanation: "Slicing extracts parts of sequences like lists, strings."
      },
      {
        question: "Which keyword handles exceptions?",
        options: [
          "try-except",
          "catch",
          "throw",
          "All of the above"
        ],
        correctAnswer: 0,
        explanation: "try-except blocks handle exceptions in Python."
      },
      {
        question: "What is @decorator?",
        options: [
          "Function modifier",
          "Syntax sugar",
          "Wrapper function",
          "All of the above"
        ],
        correctAnswer: 3,
        explanation: "Decorators modify functions using @ syntax."
      },
      {
        question: "Which method is for string formatting?",
        options: [
          "format()",
          "f-strings",
          "% formatting",
          "All of the above"
        ],
        correctAnswer: 3,
        explanation: "Python supports multiple string formatting methods."
      },
      {
        question: "What is lambda function?",
        options: [
          "Anonymous function",
          "Inline function",
          "One-line function",
          "All of the above"
        ],
        correctAnswer: 3,
        explanation: "Lambda functions are anonymous, inline one-line functions."
      },
      {
        question: "Which module is for dates?",
        options: [
          "datetime",
          "time",
          "calendar",
          "All of the above"
        ],
        correctAnswer: 3,
        explanation: "All these modules handle date/time operations."
      },
      {
        question: "What is __name__ variable?",
        options: [
          "Module name",
          "Script name",
          "Both 1 and 2",
          "Class name"
        ],
        correctAnswer: 2,
        explanation: "__name__ gives module name or '__main__' for main script."
      },
      {
        question: "Which method is for list sorting?",
        options: [
          "sort()",
          "sorted()",
          "Both 1 and 2",
          "order()"
        ],
        correctAnswer: 2,
        explanation: "Both sort() and sorted() sort lists."
      },
      {
        question: "What is virtual environment?",
        options: [
          "Isolated Python environment",
          "Virtual machine",
          "Docker container",
          "All of the above"
        ],
        correctAnswer: 0,
        explanation: "Virtual environment provides isolated Python installation."
      },
      {
        question: "Which operator is for floor division?",
        options: [
          "/",
          "//",
          "%",
          "**"
        ],
        correctAnswer: 1,
        explanation: "// is the floor division operator."
      },
      {
        question: "What is pickle module for?",
        options: [
          "Object serialization",
          "File handling",
          "Data compression",
          "All of the above"
        ],
        correctAnswer: 0,
        explanation: "Pickle module serializes Python objects."
      },
      {
        question: "Which method removes list items?",
        options: [
          "remove()",
          "pop()",
          "del",
          "All of the above"
        ],
        correctAnswer: 3,
        explanation: "All these methods remove list items."
      },
      {
        question: "What is @property decorator?",
        options: [
          "Getter method",
          "Setter method",
          "Property definition",
          "All of the above"
        ],
        correctAnswer: 3,
        explanation: "@property defines getters, setters for class properties."
      },
      {
        question: "Which module is for testing?",
        options: [
          "unittest",
          "pytest",
          "doctest",
          "All of the above"
        ],
        correctAnswer: 3,
        explanation: "Python has multiple testing frameworks."
      },
      {
        question: "What is context manager?",
        options: [
          "with statement",
          "Resource management",
          "Both 1 and 2",
          "Exception handling"
        ],
        correctAnswer: 2,
        explanation: "Context managers handle resources using with statement."
      },
      {
        question: "Which method is for string splitting?",
        options: [
          "split()",
          "partition()",
          "rsplit()",
          "All of the above"
        ],
        correctAnswer: 3,
        explanation: "All these methods split strings differently."
      },
      {
        question: "What is __str__ method?",
        options: [
          "String representation",
          "Informal string",
          "Both 1 and 2",
          "Formal string"
        ],
        correctAnswer: 2,
        explanation: "__str__ provides informal string representation."
      },
      {
        question: "Which module is for mathematics?",
        options: [
          "math",
          "numpy",
          "scipy",
          "All of the above"
        ],
        correctAnswer: 3,
        explanation: "All these modules provide mathematical functions."
      }
    ]
    // Add more languages similarly...
  };

  // Career Paths Data - Comprehensive list for India
  const careerPaths = {
    'fullstack': {
      title: 'Full Stack Development',
      description: 'Build complete web applications from frontend to backend. Master both client-side and server-side technologies to create scalable web solutions.',
      salary: {
        fresher: '₹4-8 LPA',
        midLevel: '₹8-20 LPA',
        senior: '₹20-40+ LPA'
      },
      roadmap: [
        {
          stage: 'Foundation (Months 1-3)',
          skills: ['HTML5', 'CSS3', 'JavaScript', 'Git', 'Basic Algorithms'],
          resources: ['Web Development Bootcamp', 'JavaScript Fundamentals', 'Version Control with Git']
        },
        {
          stage: 'Frontend Development (Months 4-6)',
          skills: ['React.js', 'Vue.js', 'TypeScript', 'Tailwind CSS', 'State Management'],
          resources: ['React Complete Guide', 'Advanced JavaScript', 'Frontend Frameworks']
        },
        {
          stage: 'Backend Development (Months 7-9)',
          skills: ['Node.js', 'Express.js', 'Databases (SQL/NoSQL)', 'REST APIs', 'Authentication'],
          resources: ['Node.js Mastery', 'Database Design', 'API Development']
        },
        {
          stage: 'Advanced Concepts (Months 10-12)',
          skills: ['DevOps Basics', 'Testing', 'Performance', 'Security', 'Deployment'],
          resources: ['Full Stack Projects', 'System Design', 'Cloud Deployment']
        }
      ],
      companies: ['TCS', 'Infosys', 'Wipro', 'HCL', 'Accenture', 'Amazon', 'Google', 'Microsoft', 'Flipkart', 'Zomato']
    },
    'frontend': {
      title: 'Frontend Development',
      description: 'Specialize in creating engaging user interfaces and seamless user experiences using modern web technologies.',
      salary: {
        fresher: '₹3-6 LPA',
        midLevel: '₹6-15 LPA',
        senior: '₹15-30+ LPA'
      },
      roadmap: [
        {
          stage: 'Fundamentals (Months 1-2)',
          skills: ['HTML5', 'CSS3', 'JavaScript ES6+', 'Responsive Design'],
          resources: ['HTML/CSS Mastery', 'Modern JavaScript', 'CSS Frameworks']
        },
        {
          stage: 'Framework Mastery (Months 3-6)',
          skills: ['React.js/Angular/Vue', 'TypeScript', 'State Management', 'Component Libraries'],
          resources: ['React Professional', 'TypeScript Basics', 'UI/UX Principles']
        },
        {
          stage: 'Advanced Frontend (Months 7-9)',
          skills: ['Performance Optimization', 'Testing', 'PWA', 'Web Accessibility'],
          resources: ['Frontend Performance', 'Testing Strategies', 'Advanced CSS']
        },
        {
          stage: 'Specialization (Months 10-12)',
          skills: ['Animation', 'WebGL', 'Mobile Development', 'Build Tools'],
          resources: ['Advanced Animations', 'Cross-platform Apps', 'Tooling Mastery']
        }
      ],
      companies: ['Google', 'Microsoft', 'Amazon', 'Flipkart', 'Swiggy', 'Paytm', 'Razorpay', 'Freshworks']
    },
    'backend': {
      title: 'Backend Development',
      description: 'Focus on server-side logic, database management, and API development to power web applications.',
      salary: {
        fresher: '₹4-7 LPA',
        midLevel: '₹7-18 LPA',
        senior: '₹18-35+ LPA'
      },
      roadmap: [
        {
          stage: 'Programming Foundation (Months 1-3)',
          skills: ['Java/Python/Node.js', 'Data Structures', 'Algorithms', 'OOP Concepts'],
          resources: ['Programming Fundamentals', 'DSA Course', 'Backend Basics']
        },
        {
          stage: 'Backend Technologies (Months 4-6)',
          skills: ['Spring Boot/Django/Express', 'REST APIs', 'Database Design', 'ORM'],
          resources: ['Backend Framework', 'API Design', 'Database Management']
        },
        {
          stage: 'System Design (Months 7-9)',
          skills: ['Microservices', 'Caching', 'Message Queues', 'Load Balancing'],
          resources: ['System Design Basics', 'Cloud Computing', 'Scalability']
        },
        {
          stage: 'Advanced Backend (Months 10-12)',
          skills: ['DevOps', 'Security', 'Performance', 'Monitoring'],
          resources: ['Backend Security', 'Performance Tuning', 'Production Deployment']
        }
      ],
      companies: ['Amazon', 'Microsoft', 'Google', 'Uber', 'Ola', 'PayPal', 'Razorpay', 'Directi']
    },
    'mobile': {
      title: 'Mobile App Development',
      description: 'Create native or cross-platform mobile applications for iOS and Android platforms.',
      salary: {
        fresher: '₹3-6 LPA',
        midLevel: '₹6-16 LPA',
        senior: '₹16-32+ LPA'
      },
      roadmap: [
        {
          stage: 'Platform Choice (Months 1-2)',
          skills: ['Java/Kotlin (Android)', 'Swift (iOS)', 'React Native/Flutter'],
          resources: ['Mobile Development Basics', 'Platform Fundamentals', 'Cross-platform Intro']
        },
        {
          stage: 'Native Development (Months 3-6)',
          skills: ['Android SDK', 'iOS SDK', 'UI Components', 'Platform APIs'],
          resources: ['Native App Development', 'Platform-specific Tools', 'Mobile UI/UX']
        },
        {
          stage: 'Cross-platform (Months 7-9)',
          skills: ['React Native', 'Flutter', 'Dart', 'State Management'],
          resources: ['Cross-platform Frameworks', 'Mobile Architecture', 'Advanced Features']
        },
        {
          stage: 'Advanced Mobile (Months 10-12)',
          skills: ['Performance', 'Security', 'Testing', 'App Store Deployment'],
          resources: ['Mobile Optimization', 'Security Best Practices', 'Store Guidelines']
        }
      ],
      companies: ['Google', 'Microsoft', 'Flipkart', 'Swiggy', 'Ola', 'PhonePe', 'Byju\'s', 'Unacademy']
    },
    'data-science': {
      title: 'Data Science',
      description: 'Extract insights from data using statistical analysis, machine learning, and data visualization techniques.',
      salary: {
        fresher: '₹5-9 LPA',
        midLevel: '₹9-20 LPA',
        senior: '₹20-45+ LPA'
      },
      roadmap: [
        {
          stage: 'Mathematics & Statistics (Months 1-3)',
          skills: ['Linear Algebra', 'Calculus', 'Statistics', 'Probability'],
          resources: ['Mathematics for DS', 'Statistical Methods', 'Probability Theory']
        },
        {
          stage: 'Programming & Tools (Months 4-6)',
          skills: ['Python/R', 'SQL', 'Pandas', 'NumPy', 'Data Visualization'],
          resources: ['Python for DS', 'SQL Mastery', 'Data Analysis Tools']
        },
        {
          stage: 'Machine Learning (Months 7-9)',
          skills: ['ML Algorithms', 'Scikit-learn', 'Model Evaluation', 'Feature Engineering'],
          resources: ['Machine Learning Basics', 'ML Algorithms', 'Model Deployment']
        },
        {
          stage: 'Advanced Topics (Months 10-12)',
          skills: ['Deep Learning', 'Big Data', 'MLOps', 'Cloud Platforms'],
          resources: ['Advanced ML', 'Big Data Tools', 'Cloud ML Services']
        }
      ],
      companies: ['Amazon', 'Microsoft', 'Google', 'Flipkart', 'Walmart Labs', 'American Express', 'Fractal', 'Tredence']
    },
    'ai-ml': {
      title: 'AI/ML Engineering',
      description: 'Design and implement artificial intelligence and machine learning systems to solve complex problems.',
      salary: {
        fresher: '₹6-12 LPA',
        midLevel: '₹12-25 LPA',
        senior: '₹25-50+ LPA'
      },
      roadmap: [
        {
          stage: 'Foundation (Months 1-3)',
          skills: ['Python', 'Mathematics', 'Statistics', 'Basic ML Concepts'],
          resources: ['AI/ML Fundamentals', 'Mathematical Foundation', 'Programming for AI']
        },
        {
          stage: 'Core ML (Months 4-6)',
          skills: ['Supervised Learning', 'Unsupervised Learning', 'Neural Networks', 'TensorFlow/PyTorch'],
          resources: ['Machine Learning', 'Deep Learning Basics', 'ML Frameworks']
        },
        {
          stage: 'Advanced AI (Months 7-9)',
          skills: ['NLP', 'Computer Vision', 'Reinforcement Learning', 'GANs'],
          resources: ['Natural Language Processing', 'Computer Vision', 'Advanced DL']
        },
        {
          stage: 'Specialization (Months 10-12)',
          skills: ['MLOps', 'Model Deployment', 'Cloud AI', 'Research Methods'],
          resources: ['Production ML Systems', 'Cloud AI Platforms', 'Research Papers']
        }
      ],
      companies: ['Google', 'Microsoft', 'Amazon', 'IBM', 'Nvidia', 'OpenAI', 'Tesla', 'Adobe']
    },
    'devops': {
      title: 'DevOps Engineering',
      description: 'Bridge development and operations through automation, CI/CD, and infrastructure management.',
      salary: {
        fresher: '₹5-8 LPA',
        midLevel: '₹8-18 LPA',
        senior: '₹18-35+ LPA'
      },
      roadmap: [
        {
          stage: 'Linux & Scripting (Months 1-3)',
          skills: ['Linux Administration', 'Bash Scripting', 'Networking', 'Basic Programming'],
          resources: ['Linux Fundamentals', 'Shell Scripting', 'Networking Basics']
        },
        {
          stage: 'Cloud & Containers (Months 4-6)',
          skills: ['AWS/Azure/GCP', 'Docker', 'Kubernetes', 'Infrastructure as Code'],
          resources: ['Cloud Computing', 'Containerization', 'Orchestration Tools']
        },
        {
          stage: 'CI/CD & Automation (Months 7-9)',
          skills: ['Jenkins/GitLab CI', 'Ansible/Terraform', 'Monitoring', 'Logging'],
          resources: ['CI/CD Pipelines', 'Infrastructure Automation', 'Monitoring Tools']
        },
        {
          stage: 'Advanced DevOps (Months 10-12)',
          skills: ['Security', 'Performance', 'Cost Optimization', 'Site Reliability'],
          resources: ['DevSecOps', 'Performance Engineering', 'SRE Practices']
        }
      ],
      companies: ['Amazon', 'Microsoft', 'Google', 'Netflix', 'Uber', 'Adobe', 'Intuit', 'VMware']
    },
    'cybersecurity': {
      title: 'Cyber Security',
      description: 'Protect systems, networks, and data from digital attacks and ensure information security.',
      salary: {
        fresher: '₹4-7 LPA',
        midLevel: '₹7-16 LPA',
        senior: '₹16-35+ LPA'
      },
      roadmap: [
        {
          stage: 'Fundamentals (Months 1-3)',
          skills: ['Networking', 'Operating Systems', 'Basic Programming', 'Security Concepts'],
          resources: ['Cyber Security Basics', 'Network Security', 'OS Security']
        },
        {
          stage: 'Security Domains (Months 4-6)',
          skills: ['Cryptography', 'Web Security', 'Network Security', 'Vulnerability Assessment'],
          resources: ['Cryptography Basics', 'Web App Security', 'Network Defense']
        },
        {
          stage: 'Advanced Security (Months 7-9)',
          skills: ['Penetration Testing', 'Incident Response', 'Forensics', 'Security Tools'],
          resources: ['Ethical Hacking', 'Digital Forensics', 'Security Operations']
        },
        {
          stage: 'Specialization (Months 10-12)',
          skills: ['Cloud Security', 'IoT Security', 'Mobile Security', 'Compliance'],
          resources: ['Cloud Security', 'Emerging Threats', 'Security Standards']
        }
      ],
      companies: ['TCS', 'Wipro', 'HCL', 'Accenture', 'IBM', 'Palo Alto', 'CrowdStrike', 'Quick Heal']
    },
    'cloud': {
      title: 'Cloud Computing',
      description: 'Design, deploy, and manage cloud infrastructure and services across various cloud platforms.',
      salary: {
        fresher: '₹4-8 LPA',
        midLevel: '₹8-18 LPA',
        senior: '₹18-40+ LPA'
      },
      roadmap: [
        {
          stage: 'Cloud Fundamentals (Months 1-3)',
          skills: ['Cloud Concepts', 'Virtualization', 'Networking', 'Basic Linux'],
          resources: ['Cloud Computing Basics', 'Virtualization Tech', 'Cloud Networking']
        },
        {
          stage: 'Cloud Platforms (Months 4-6)',
          skills: ['AWS/Azure/GCP Services', 'Storage', 'Compute', 'Database Services'],
          resources: ['Cloud Platform Certifications', 'Service Offerings', 'Cloud Architecture']
        },
        {
          stage: 'Advanced Cloud (Months 7-9)',
          skills: ['Cloud Security', 'Migration', 'Cost Optimization', 'Multi-cloud'],
          resources: ['Cloud Security', 'Migration Strategies', 'Cost Management']
        },
        {
          stage: 'Specialization (Months 10-12)',
          skills: ['Solutions Architecture', 'DevOps Integration', 'Big Data', 'Machine Learning'],
          resources: ['Cloud Solutions', 'Advanced Services', 'Emerging Technologies']
        }
      ],
      companies: ['Amazon', 'Microsoft', 'Google', 'IBM', 'Oracle', 'VMware', 'Salesforce', 'ServiceNow']
    },
    'qa': {
      title: 'QA Engineering',
      description: 'Ensure software quality through manual and automated testing methodologies.',
      salary: {
        fresher: '₹3-5 LPA',
        midLevel: '₹5-12 LPA',
        senior: '₹12-25 LPA'
      },
      roadmap: [
        {
          stage: 'Testing Fundamentals (Months 1-3)',
          skills: ['Manual Testing', 'Test Cases', 'Bug Tracking', 'SDLC'],
          resources: ['Software Testing', 'Testing Methodologies', 'Tools Introduction']
        },
        {
          stage: 'Automation (Months 4-6)',
          skills: ['Selenium', 'Java/Python', 'TestNG/JUnit', 'API Testing'],
          resources: ['Test Automation', 'Programming for QA', 'API Testing Tools']
        },
        {
          stage: 'Advanced Testing (Months 7-9)',
          skills: ['Performance Testing', 'Security Testing', 'Mobile Testing', 'CI/CD Integration'],
          resources: ['Performance Engineering', 'Security Testing', 'Mobile Test Automation']
        },
        {
          stage: 'Specialization (Months 10-12)',
          skills: ['Test Strategy', 'Leadership', 'Tools Mastery', 'Process Improvement'],
          resources: ['Test Management', 'QA Leadership', 'Advanced Tools']
        }
      ],
      companies: ['TCS', 'Infosys', 'Wipro', 'Capgemini', 'Accenture', 'Cognizant', 'Tech Mahindra']
    },
    'blockchain': {
      title: 'Blockchain Development',
      description: 'Build decentralized applications and smart contracts using blockchain technology.',
      salary: {
        fresher: '₹6-12 LPA',
        midLevel: '₹12-25 LPA',
        senior: '₹25-50+ LPA'
      },
      roadmap: [
        {
          stage: 'Blockchain Fundamentals (Months 1-3)',
          skills: ['Cryptography', 'Distributed Systems', 'Blockchain Basics', 'Bitcoin/Ethereum'],
          resources: ['Blockchain Basics', 'Cryptography', 'Distributed Ledger']
        },
        {
          stage: 'Smart Contracts (Months 4-6)',
          skills: ['Solidity', 'Ethereum', 'Smart Contract Development', 'Web3.js'],
          resources: ['Smart Contract Programming', 'Ethereum Development', 'DApp Basics']
        },
        {
          stage: 'DApp Development (Months 7-9)',
          skills: ['Truffle/Hardhat', 'IPFS', 'Token Standards', 'DeFi Protocols'],
          resources: ['DApp Development', 'DeFi Protocols', 'Blockchain Tools']
        },
        {
          stage: 'Advanced Blockchain (Months 10-12)',
          skills: ['Scalability Solutions', 'Security Auditing', 'Cross-chain', 'NFT Development'],
          resources: ['Blockchain Scaling', 'Security Best Practices', 'Advanced Protocols']
        }
      ],
      companies: ['Coinbase', 'Binance', 'Polygon', 'CoinDCX', 'WazirX', 'ConsenSys', 'Chainlink']
    },
    'game-dev': {
      title: 'Game Development',
      description: 'Create interactive games for various platforms using game engines and programming.',
      salary: {
        fresher: '₹3-6 LPA',
        midLevel: '₹6-15 LPA',
        senior: '₹15-30+ LPA'
      },
      roadmap: [
        {
          stage: 'Game Design (Months 1-3)',
          skills: ['Game Mechanics', 'Level Design', 'Storytelling', 'Basic Programming'],
          resources: ['Game Design Principles', 'Programming Basics', 'Game Development Intro']
        },
        {
          stage: 'Game Engines (Months 4-6)',
          skills: ['Unity/Unreal Engine', 'C#/C++', '3D Modeling Basics', 'Physics'],
          resources: ['Unity/Unreal Tutorials', 'Game Programming', '3D Fundamentals']
        },
        {
          stage: 'Advanced Development (Months 7-9)',
          skills: ['AI Programming', 'Multiplayer', 'Optimization', 'VR/AR Development'],
          resources: ['Game AI', 'Network Programming', 'Performance Optimization']
        },
        {
          stage: 'Specialization (Months 10-12)',
          skills: ['Special Effects', 'Audio Engineering', 'Publishing', 'Monetization'],
          resources: ['Advanced Graphics', 'Audio Programming', 'Game Publishing']
        }
      ],
      companies: ['Ubisoft', 'EA', 'Rockstar', 'Nintendo', 'Sony', 'Microsoft', 'Zynga', 'Nazara']
    },
    'ar-vr': {
      title: 'AR/VR Development',
      description: 'Create immersive augmented and virtual reality experiences for various applications.',
      salary: {
        fresher: '₹4-8 LPA',
        midLevel: '₹8-18 LPA',
        senior: '₹18-35+ LPA'
      },
      roadmap: [
        {
          stage: 'Fundamentals (Months 1-3)',
          skills: ['3D Mathematics', 'Game Engines', 'Basic Programming', 'UX for VR/AR'],
          resources: ['3D Math Basics', 'Unity/Unreal Intro', 'XR Development']
        },
        {
          stage: 'Development Tools (Months 4-6)',
          skills: ['Unity AR/VR', 'Unreal Engine', 'ARKit/ARCore', '3D Modeling'],
          resources: ['AR/VR SDKs', '3D Modeling Tools', 'Platform-specific Development']
        },
        {
          stage: 'Advanced Development (Months 7-9)',
          skills: ['Spatial Computing', 'Hand Tracking', 'Multi-user VR', 'Performance Optimization'],
          resources: ['Advanced XR', 'Spatial Design', 'Multi-user Experiences']
        },
        {
          stage: 'Specialization (Months 10-12)',
          skills: ['Enterprise AR/VR', 'Medical VR', 'Education VR', 'Hardware Integration'],
          resources: ['Industry Applications', 'Hardware Development', 'Emerging Technologies']
        }
      ],
      companies: ['Google', 'Microsoft', 'Meta', 'Apple', 'Samsung', 'TCS', 'Infosys', 'Startups']
    }
  };

  useEffect(() => {
    checkUser();
    initializeSpeechRecognition();
  }, []);

  useEffect(() => {
    if (user) {
      loadUserData();
      // Add welcome message from AI mentor
      setChatMessages([{
        role: 'assistant',
        content: `Hello ${profile?.full_name || 'there'}! I'm your AI Career Mentor. I can help you with:\n\n• Career guidance and path planning\n• Technical interview preparation\n• Learning roadmap suggestions\n• Code review and best practices\n• Resume and portfolio advice\n\nWhat would you like to discuss today?`,
        timestamp: new Date()
      }]);
    }
  }, [user]);

  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast.error("Speech recognition failed");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognition);
    }
  };

  const toggleSpeechRecognition = () => {
    if (!recognition) {
      toast.error("Speech recognition not supported in your browser");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;

      setProfile(profileData);

      // Check if user is admin based on user_roles table
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      const hasAdminRole = roles?.some(role => role.role === 'admin');
      setIsAdmin(hasAdminRole);

      if (profileData.approval_status === "pending") {
        toast.info("Your account is pending admin approval", {
          description: "You'll have access once an admin reviews your account.",
        });
      } else if (profileData.approval_status === "rejected") {
        toast.error("Your account has been rejected");
        await supabase.auth.signOut();
        navigate("/auth");
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      // Load user stats
      await loadUserStats();
      
      // Load learning videos
      await loadLearningVideos();
      
      // Load enrollments (user's courses)
      await loadEnrollments();
      
      // Load all available courses
      await loadAllCourses();
      
      // Load course videos
      await loadCourseVideos();
      
      // Load daily challenges
      await loadDailyChallenges();
      
      // Load achievements
      await loadAchievements();
      
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Failed to load dashboard data");
    }
  };

  const loadUserStats = async () => {
    try {
      // Get video progress count
      const { data: videoProgress, error: videoError } = await supabase
        .from("user_video_progress")
        .select("progress")
        .eq("user_id", user.id)
        .eq("progress", 100);

      if (videoError) throw videoError;

      // Get enrollments count
      const { data: enrollmentsData, error: enrollError } = await supabase
        .from("enrollments")
        .select("progress, completed_at")
        .eq("user_id", user.id);

      if (enrollError) throw enrollError;

      // Get solved challenges count
      const { data: solvedChallenges, error: challengeError } = await supabase
        .from("user_challenge_solutions")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_correct", true);

      // Get achievements count
      const { data: userAchievementsData, error: achievementError } = await supabase
        .from("user_achievements")
        .select("id")
        .eq("user_id", user.id);

      const videosWatched = videoProgress?.length || 0;
      const totalEnrollments = enrollmentsData?.length || 0;
      const completedCourses = enrollmentsData?.filter(e => e.progress === 100).length || 0;
      const problemsSolved = solvedChallenges?.length || 0;
      const achievementsCount = userAchievementsData?.length || 0;

      setUserStats({
        videosWatched,
        problemsSolved,
        currentStreak: 0, // You can add streaks table later
        weeklyGoal: Math.min(100, Math.round((videosWatched + completedCourses + problemsSolved) / 15 * 100)),
        totalCourses: totalEnrollments,
        completedCourses,
        achievements: achievementsCount
      });
    } catch (error) {
      console.error("Error loading user stats:", error);
    }
  };

  const loadLearningVideos = async () => {
    try {
      const { data: videos, error } = await supabase
        .from("learning_videos")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;

      // Get user progress for these videos
      const { data: progress, error: progressError } = await supabase
        .from("user_video_progress")
        .select("video_id, progress")
        .eq("user_id", user.id)
        .in("video_id", videos?.map(v => v.id) || []);

      const videosWithProgress = videos?.map(video => {
        const userProgress = progress?.find(p => p.video_id === video.id);
        return {
          ...video,
          progress: userProgress?.progress || 0
        };
      }) || [];

      setLearningVideos(videosWithProgress);
    } catch (error: any) {
      console.error("Error loading videos:", error);
      toast.error("Failed to load videos");
    }
  };

  const loadEnrollments = async () => {
    try {
      const { data: enrollmentsData, error } = await supabase
        .from("enrollments")
        .select(`
          *,
          courses (
            id,
            title,
            description,
            category,
            difficulty,
            thumbnail_url,
            duration_hours
          )
        `)
        .eq("user_id", user.id)
        .order("enrolled_at", { ascending: false });

      if (error) throw error;

      setEnrollments(enrollmentsData || []);
    } catch (error) {
      console.error("Error loading enrollments:", error);
      setEnrollments([]);
    }
  };

  const loadAllCourses = async () => {
    try {
      const { data: courses, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAllCourses(courses || []);
    } catch (error) {
      console.error("Error loading courses:", error);
      setAllCourses([]);
    }
  };

  const loadCourseVideos = async () => {
    try {
      const { data: videos, error } = await supabase
        .from("course_videos")
        .select(`
          *,
          courses (
            title
          )
        `)
        .order("order_index", { ascending: true });

      if (error) throw error;

      setCourseVideos(videos || []);
    } catch (error) {
      console.error("Error loading course videos:", error);
      setCourseVideos([]);
    }
  };

  const loadDailyChallenges = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: challenges, error } = await supabase
        .from("daily_challenges")
        .select("*")
        .gte("date", today)
        .lte("date", today)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setDailyChallenges(challenges || []);
    } catch (error) {
      console.error("Error loading daily challenges:", error);
      setDailyChallenges([]);
    }
  };

  const loadAchievements = async () => {
    try {
      // Load all available achievements
      const { data: achievementsData, error } = await supabase
        .from("achievements")
        .select("*")
        .order("points", { ascending: false });

      if (error) throw error;

      // Load user's earned achievements
      const { data: userAchievementsData, error: userError } = await supabase
        .from("user_achievements")
        .select("achievement_id, earned_at")
        .eq("user_id", user.id);

      if (userError) throw userError;

      const achievementsWithStatus = achievementsData?.map(achievement => ({
        ...achievement,
        earned: userAchievementsData?.some(ua => ua.achievement_id === achievement.id) || false,
        earned_at: userAchievementsData?.find(ua => ua.achievement_id === achievement.id)?.earned_at
      })) || [];

      setAchievements(achievementsWithStatus);
      setUserAchievements(userAchievementsData || []);
    } catch (error) {
      console.error("Error loading achievements:", error);
      setAchievements([]);
      setUserAchievements([]);
    }
  };

  const enrollInCourse = async (courseId: string) => {
    try {
      const { error } = await supabase
        .from("enrollments")
        .insert({
          user_id: user.id,
          course_id: courseId,
          progress: 0,
          enrolled_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success("Successfully enrolled in course!");
      loadEnrollments();
      loadUserStats();
      
      // Check for achievement
      await checkAchievement('first_course');
    } catch (error: any) {
      console.error("Error enrolling in course:", error);
      toast.error("Failed to enroll in course");
    }
  };

  const updateCourseProgress = async (enrollmentId: string, progress: number) => {
    try {
      const { error } = await supabase
        .from("enrollments")
        .update({
          progress: progress,
          ...(progress === 100 ? { completed_at: new Date().toISOString() } : {})
        })
        .eq("id", enrollmentId);

      if (error) throw error;

      toast.success("Progress updated!");
      loadEnrollments();
      loadUserStats();
      
      // Check for achievement if course completed
      if (progress === 100) {
        await checkAchievement('course_completion');
      }
    } catch (error) {
      console.error("Error updating course progress:", error);
      toast.error("Failed to update progress");
    }
  };

  const markVideoAsWatched = async (videoId: string, videoType: 'learning_video' | 'course_video' = 'learning_video') => {
    try {
      const { error } = await supabase
        .from("user_video_progress")
        .upsert({
          user_id: user.id,
          video_id: videoId,
          video_type: videoType,
          progress: 100,
          watched_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success("Video marked as watched!");
      loadUserData();
      
      // Check for achievement
      await checkAchievement('video_watcher');
    } catch (error) {
      console.error("Error updating video progress:", error);
      toast.error("Failed to update progress");
    }
  };

  const addNewCourse = async () => {
    try {
      if (!isAdmin) {
        toast.error("Only admins can add courses");
        return;
      }

      const { data: course, error } = await supabase
        .from("courses")
        .insert([{
          ...courseForm,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success("Course added successfully!");
      
      setCourseForm({
        title: '',
        description: '',
        category: '',
        difficulty: '',
        duration_hours: null,
        thumbnail_url: '',
        is_trending: false
      });
      
      loadAllCourses();
    } catch (error: any) {
      console.error("Error adding course:", error);
      toast.error(`Failed to add course: ${error.message}`);
    }
  };

  const updateExistingCourse = async () => {
    try {
      if (!editingCourse) return;

      const { error } = await supabase
        .from("courses")
        .update({
          ...courseForm,
          updated_at: new Date().toISOString()
        })
        .eq("id", editingCourse.id);

      if (error) throw error;

      toast.success("Course updated successfully!");
      cancelEdit();
      loadAllCourses();
    } catch (error: any) {
      console.error("Error updating course:", error);
      toast.error(`Failed to update course: ${error.message}`);
    }
  };

  const deleteCourse = async (courseId: string) => {
    try {
      if (!isAdmin) {
        toast.error("Only admins can delete courses");
        return;
      }

      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", courseId);

      if (error) throw error;

      toast.success("Course deleted successfully!");
      loadAllCourses();
    } catch (error: any) {
      console.error("Error deleting course:", error);
      toast.error(`Failed to delete course: ${error.message}`);
    }
  };

  const addVideoToCourse = async () => {
    try {
      if (!isAdmin) {
        toast.error("Only admins can add videos");
        return;
      }

      const { data: video, error } = await supabase
        .from("course_videos")
        .insert([{
          ...videoForm,
          created_by: user.id,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success("Video added to course successfully!");
      
      setVideoForm({
        title: '',
        description: '',
        url: '',
        duration: '',
        course_id: '',
        order_index: 0,
        thumbnail_url: ''
      });
      
      loadCourseVideos();
    } catch (error: any) {
      console.error("Error adding video:", error);
      toast.error(`Failed to add video: ${error.message}`);
    }
  };

  const addDailyChallenge = async () => {
    try {
      if (!isAdmin) {
        toast.error("Only admins can add challenges");
        return;
      }

      const { data: challenge, error } = await supabase
        .from("daily_challenges")
        .insert([{
          ...challengeForm,
          date: new Date().toISOString().split('T')[0],
          created_by: user.id,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success("Daily challenge added successfully!");
      
      setChallengeForm({
        title: '',
        description: '',
        difficulty: 'beginner',
        problem_statement: '',
        test_cases: '',
        solution_template: '',
        category: 'programming'
      });
      
      loadDailyChallenges();
    } catch (error: any) {
      console.error("Error adding challenge:", error);
      toast.error(`Failed to add challenge: ${error.message}`);
    }
  };

  const checkAchievement = async (achievementType: string) => {
    try {
      const { data: achievement, error } = await supabase
        .from("achievements")
        .select("id")
        .eq("type", achievementType)
        .single();

      if (error || !achievement) return;

      // Check if user already has this achievement
      const { data: existing } = await supabase
        .from("user_achievements")
        .select("id")
        .eq("user_id", user.id)
        .eq("achievement_id", achievement.id)
        .single();

      if (!existing) {
        const { error: insertError } = await supabase
          .from("user_achievements")
          .insert({
            user_id: user.id,
            achievement_id: achievement.id,
            earned_at: new Date().toISOString()
          });

        if (!insertError) {
          toast.success("🎉 Achievement Unlocked!", {
            description: `You earned a new achievement!`,
          });
          loadAchievements();
          loadUserStats();
        }
      }
    } catch (error) {
      console.error("Error checking achievement:", error);
    }
  };

  // Quiz Functions
  const startQuiz = (language: string) => {
    setSelectedLanguage(language);
    const quiz = quizDatabase[language] || [];
    setCurrentQuiz(quiz);
    setCurrentQuestionIndex(0);
    setQuizScore(0);
    setQuizCompleted(false);
    setQuizStarted(true);
    setSelectedAnswer("");
    setUserAnswers(new Array(quiz.length).fill(""));
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === "") {
      toast.error("Please select an answer");
      return;
    }

    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestionIndex] = selectedAnswer;
    setUserAnswers(newUserAnswers);

    // Check if answer is correct
    const currentQuestion = currentQuiz[currentQuestionIndex];
    if (selectedAnswer === currentQuestion.options[currentQuestion.correctAnswer]) {
      setQuizScore(quizScore + 1);
    }

    if (currentQuestionIndex < currentQuiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(userAnswers[currentQuestionIndex + 1] || "");
    } else {
      setQuizCompleted(true);
      // Check for achievement
      if (quizScore + (selectedAnswer === currentQuestion.options[currentQuestion.correctAnswer] ? 1 : 0) >= currentQuiz.length * 0.8) {
        checkAchievement('quiz_master');
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(userAnswers[currentQuestionIndex - 1] || "");
    }
  };

  const restartQuiz = () => {
    setQuizStarted(false);
    setSelectedLanguage("");
    setCurrentQuiz(null);
    setCurrentQuestionIndex(0);
    setQuizScore(0);
    setQuizCompleted(false);
    setSelectedAnswer("");
    setUserAnswers([]);
  };

  // AI Chatbot Functions
  const sendMessageToAI = async (message: string) => {
    if (!message.trim()) return;

    setIsLoading(true);
    const userMessage = { role: 'user', content: message, timestamp: new Date() };
    setChatMessages(prev => [...prev, userMessage]);
    setUserInput('');

    try {
      // Fallback responses
      const fallbackResponses = [
        `I'd be happy to help with "${message}". Based on your learning progress (${userStats.videosWatched} videos watched, ${userStats.completedCourses} courses completed), I recommend focusing on practical projects to reinforce your skills.`,
        `Great question about "${message}"! For career growth, consider building a portfolio with real-world projects. Your current progress shows good consistency - keep it up!`,
        `Regarding "${message}", here's my advice: Practice regularly, contribute to open source, and network with other developers. Your ${userStats.problemsSolved} problems solved shows great dedication!`
      ];

      let aiResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      try {
        const GEMINI_API_KEY = "AIzaSyAWUbSBb_KpmtAwdj12HiH62de_5uaPRtI";
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are an AI Career Mentor for FutureLearnX platform. The user is ${profile?.full_name || 'a learner'} with the following stats: ${userStats.videosWatched} videos watched, ${userStats.totalCourses} courses enrolled, ${userStats.completedCourses} courses completed, ${userStats.problemsSolved} problems solved. Provide helpful, encouraging career guidance and technical advice.

User's message: ${message}

Please respond as a supportive career mentor, focusing on career guidance, technical interview preparation, and learning roadmap suggestions. Keep responses concise but helpful.`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            aiResponse = data.candidates[0].content.parts[0].text;
          }
        }
      } catch (apiError) {
        console.warn('Gemini API error, using fallback:', apiError);
      }

      const aiMessage = { 
        role: 'assistant', 
        content: aiResponse, 
        timestamp: new Date() 
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('Error in AI chat:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: "I apologize, but I'm having trouble responding right now. Please try again later.", 
        timestamp: new Date() 
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (userInput.trim()) {
      sendMessageToAI(userInput.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setChatMessages([{
      role: 'assistant',
      content: `Hello ${profile?.full_name || 'there'}! I'm your AI Career Mentor. I can help you with career guidance and technical advice. What would you like to discuss today?`,
      timestamp: new Date()
    }]);
  };

  const editCourse = (course: any) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description,
      category: course.category,
      difficulty: course.difficulty,
      duration_hours: course.duration_hours,
      thumbnail_url: course.thumbnail_url || '',
      is_trending: course.is_trending || false
    });
  };

  const cancelEdit = () => {
    setEditingCourse(null);
    setCourseForm({
      title: '',
      description: '',
      category: '',
      difficulty: '',
      duration_hours: null,
      thumbnail_url: '',
      is_trending: false
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      case "intermediate":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "advanced":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      default:
        return "bg-primary/20 text-primary border-primary/50";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "programming":
        return "bg-blue-500/20 text-blue-400";
      case "web-development":
        return "bg-purple-500/20 text-purple-400";
      case "data-science":
        return "bg-orange-500/20 text-orange-400";
      case "mobile-development":
        return "bg-green-500/20 text-green-400";
      case "algorithms":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-primary/20 text-primary";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "programming":
        return <Code className="w-4 h-4" />;
      case "web-development":
        return <Globe className="w-4 h-4" />;
      case "data-science":
        return <Database className="w-4 h-4" />;
      case "mobile-development":
        return <Smartphone className="w-4 h-4" />;
      case "algorithms":
        return <GitBranch className="w-4 h-4" />;
      default:
        return <Code className="w-4 h-4" />;
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const openExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (profile?.approval_status === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 border-border/40 bg-card/30 backdrop-blur max-w-md text-center">
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Account Pending Approval</h2>
          <p className="text-muted-foreground mb-6">
            Your account is waiting for admin approval. You'll receive access once approved.
          </p>
          <Button variant="outline" onClick={handleLogout}>
            Sign Out
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-sm bg-background/80 border-b border-border/40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">FutureLearnX</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/profile")}>
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
            {isAdmin && (
              <Button variant="secondary" onClick={() => navigate("/admin-videos")}>
                Manage Videos
              </Button>
            )}
            {isAdmin && (
              <Button variant="secondary" onClick={() => navigate("/admin")}>
                Admin Dashboard
              </Button>
            )}
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{profile?.full_name}</span>!
          </h1>
          <p className="text-muted-foreground">Continue your learning journey with personalized resources</p>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-9 lg:max-w-7xl border-border/40 bg-background/50 backdrop-blur">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="career-paths">Career Paths</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="quiz">Programming Quiz</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="ai-mentor">AI Mentor</TabsTrigger>
            {isAdmin && <TabsTrigger value="manage">Manage</TabsTrigger>}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 border-border/40 bg-card/30 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <PlayCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Videos Watched</p>
                    <p className="text-2xl font-bold">{userStats.videosWatched}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-border/40 bg-card/30 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <BookOpen className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Courses Enrolled</p>
                    <p className="text-2xl font-bold">{userStats.totalCourses}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-border/40 bg-card/30 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Trophy className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Achievements</p>
                    <p className="text-2xl font-bold">{userStats.achievements}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-border/40 bg-card/30 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Target className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Problems Solved</p>
                    <p className="text-2xl font-bold">{userStats.problemsSolved}</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* My Courses */}
              <Card className="p-6 border-border/40 bg-card/30 backdrop-blur">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  My Courses
                </h3>
                <div className="space-y-4">
                  {enrollments.length > 0 ? (
                    enrollments.slice(0, 3).map((enrollment) => (
                      <div key={enrollment.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/5 transition-colors">
                        <div className="flex-1">
                          <p className="font-medium">{enrollment.courses?.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={enrollment.progress} className="h-2 flex-1" />
                            <span className="text-sm text-muted-foreground">{enrollment.progress}%</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No courses enrolled yet</p>
                  )}
                </div>
                {enrollments.length > 0 && (
                  <Button variant="outline" className="w-full mt-4" onClick={() => setActiveTab("courses")}>
                    View All Courses
                  </Button>
                )}
              </Card>

              {/* Quick Actions */}
              <Card className="p-6 border-border/40 bg-card/30 backdrop-blur">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="h-auto py-3 flex flex-col gap-2"
                    onClick={() => setActiveTab("videos")}
                  >
                    <Youtube className="w-6 h-6" />
                    <span>Watch Videos</span>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-auto py-3 flex flex-col gap-2"
                    onClick={() => setActiveTab("courses")}
                  >
                    <BookOpen className="w-6 h-6" />
                    <span>Browse Courses</span>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-auto py-3 flex flex-col gap-2"
                    onClick={() => setActiveTab("quiz")}
                  >
                    <HelpCircle className="w-6 h-6" />
                    <span>Take Quiz</span>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-auto py-3 flex flex-col gap-2"
                    onClick={() => setActiveTab("ai-mentor")}
                  >
                    <Bot className="w-6 h-6" />
                    <span>AI Career Mentor</span>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-auto py-3 flex flex-col gap-2"
                    onClick={() => navigate("/code-editor")}
                  >
                    <Code className="w-6 h-6" />
                    <span>Online IDE</span>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-auto py-3 flex flex-col gap-2"
                    onClick={() => navigate("/resume-builder")}
                  >
                    <FileText className="w-6 h-6" />
                    <span>Resume Builder</span>
                  </Button>
                </div>
              </Card>
            </div>

            {/* Recent Videos */}
            {learningVideos.length > 0 && (
              <Card className="p-6 border-border/40 bg-card/30 backdrop-blur">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Youtube className="w-5 h-5 text-red-500" />
                  Recent Videos
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {learningVideos.slice(0, 3).map((video) => (
                    <Card key={video.id} className="p-4 border-border/40 bg-card/30 backdrop-blur">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm line-clamp-1">{video.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {video.duration}
                        </Badge>
                      </div>
                      <Progress value={video.progress} className="h-2 mb-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{video.progress}%</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Learning Videos Tab */}
          <TabsContent value="videos" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Youtube className="w-6 h-6 text-red-500" />
                Learning Videos
              </h2>
              <Badge variant="secondary" className="text-sm">
                {learningVideos.length} videos available
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {learningVideos.map((video) => (
                <Card key={video.id} className="overflow-hidden border-border/40 bg-card/30 backdrop-blur hover:border-primary/50 hover:bg-card/60 transition-all duration-300 feature-card">
                  <div className="relative">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/320x160/3B82F6/FFFFFF?text=Video+Thumbnail';
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant={video.platform === "YouTube" ? "destructive" : "secondary"}>
                        {video.platform}
                      </Badge>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <Badge variant="outline" className="bg-background/80">
                        <Clock className="w-3 h-3 mr-1" />
                        {video.duration}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">{video.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {video.description}
                    </p>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{video.progress}%</span>
                      </div>
                      <Progress value={video.progress} className="h-2" />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        variant="hero"
                        onClick={() => openExternalLink(video.url)}
                      >
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Watch
                      </Button>
                      {video.progress < 100 && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => markVideoAsWatched(video.id, 'learning_video')}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {learningVideos.length === 0 && (
              <Card className="p-12 text-center border-border/40 bg-card/30 backdrop-blur">
                <Youtube className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium mb-2">No videos available</p>
                <p className="text-muted-foreground mb-4">
                  Check back later for new learning videos
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-500" />
                Available Courses
              </h2>
              {isAdmin && (
                <Button onClick={() => setActiveTab("manage")} variant="hero">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Course
                </Button>
              )}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allCourses.map((course) => {
                const userEnrollment = enrollments.find(e => e.course_id === course.id);
                const courseVideosCount = courseVideos.filter(v => v.course_id === course.id).length;
                
                return (
                  <Card key={course.id} className="overflow-hidden border-border/40 bg-card/30 backdrop-blur hover:border-primary/50 hover:bg-card/60 transition-all duration-300 feature-card">
                    <div className="relative">
                      <img 
                        src={course.thumbnail_url} 
                        alt={course.title}
                        className="w-full h-40 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/320x160/3B82F6/FFFFFF?text=Course+Thumbnail';
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className={getDifficultyColor(course.difficulty)}>
                          {course.difficulty}
                        </Badge>
                      </div>
                      {course.is_trending && (
                        <div className="absolute top-2 left-2">
                          <Badge variant="default" className="bg-orange-500">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Trending
                          </Badge>
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2">
                        <Badge variant="secondary" className="bg-background/80">
                          <Video className="w-3 h-3 mr-1" />
                          {courseVideosCount} videos
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={getCategoryColor(course.category)}>
                          {getCategoryIcon(course.category)}
                          {course.category}
                        </Badge>
                        {course.duration_hours && (
                          <span className="text-xs text-muted-foreground">
                            {course.duration_hours}h
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-semibold mb-2 line-clamp-1">{course.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {course.description}
                      </p>

                      {userEnrollment ? (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{userEnrollment.progress}%</span>
                            </div>
                            <Progress value={userEnrollment.progress} className="h-2" />
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1"
                              variant="hero"
                              onClick={() => navigate(`/course/${course.id}`)}
                            >
                              Continue
                            </Button>
                            {userEnrollment.progress < 100 && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateCourseProgress(userEnrollment.id, 100)}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <Button 
                          className="w-full"
                          variant="hero"
                          onClick={() => enrollInCourse(course.id)}
                        >
                          Enroll Now
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            {allCourses.length === 0 && (
              <Card className="p-12 text-center border-border/40 bg-card/30 backdrop-blur">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium mb-2">No courses available</p>
                <p className="text-muted-foreground mb-4">
                  {isAdmin ? 'Add your first course to get started' : 'Check back later for new courses'}
                </p>
              </Card>
            )}

            {/* Course Videos Section */}
            {courseVideos.length > 0 && (
              <Card className="p-6 border-border/40 bg-card/30 backdrop-blur">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <ListVideo className="w-5 h-5 text-primary" />
                  Course Videos
                </h3>
                <div className="space-y-4">
                  {courseVideos.map((video) => (
                    <div key={video.id} className="flex items-center justify-between p-4 rounded-lg border border-border/40">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                          <PlayCircle className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{video.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {video.courses?.title} • {video.duration}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Button 
                          size="sm"
                          variant="hero"
                          onClick={() => openExternalLink(video.url)}
                        >
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Watch
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Career Paths Tab */}
          <TabsContent value="career-paths" className="space-y-6">
            {/* Career Paths content remains the same as before */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-500" />
                Career Path Recommender
              </h2>
              <Badge variant="secondary">
                India Focused
              </Badge>
            </div>

            {/* Career Path Selection */}
            <Card className="p-6 border-border/40 bg-card/30 backdrop-blur">
              <h3 className="text-xl font-bold mb-4">Discover Your Career Path</h3>
              <p className="text-muted-foreground mb-6">
                Explore comprehensive career paths in technology with detailed roadmaps, salary expectations, and learning resources tailored for the Indian market.
              </p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex flex-col gap-2"
                  onClick={() => setSelectedCareerPath('fullstack')}
                >
                  <Globe className="w-6 h-6" />
                  <span>Full Stack Development</span>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex flex-col gap-2"
                  onClick={() => setSelectedCareerPath('frontend')}
                >
                  <Code className="w-6 h-6" />
                  <span>Frontend Development</span>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex flex-col gap-2"
                  onClick={() => setSelectedCareerPath('backend')}
                >
                  <Database className="w-6 h-6" />
                  <span>Backend Development</span>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex flex-col gap-2"
                  onClick={() => setSelectedCareerPath('mobile')}
                >
                  <Smartphone className="w-6 h-6" />
                  <span>Mobile Development</span>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex flex-col gap-2"
                  onClick={() => setSelectedCareerPath('data-science')}
                >
                  <BarChart3 className="w-6 h-6" />
                  <span>Data Science</span>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex flex-col gap-2"
                  onClick={() => setSelectedCareerPath('ai-ml')}
                >
                  <Brain className="w-6 h-6" />
                  <span>AI/ML Engineering</span>
                </Button>
              </div>

              {/* Additional Career Paths */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedCareerPath('devops')}
                >
                  DevOps Engineering
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedCareerPath('cybersecurity')}
                >
                  Cyber Security
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedCareerPath('cloud')}
                >
                  Cloud Computing
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedCareerPath('qa')}
                >
                  QA Engineering
                </Button>
              </div>
            </Card>

            {/* Career Path Details */}
            {selectedCareerPath && careerPaths[selectedCareerPath] && (
              <Card className="p-6 border-border/40 bg-card/30 backdrop-blur">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-primary mb-2">
                      {careerPaths[selectedCareerPath].title}
                    </h3>
                    <p className="text-muted-foreground max-w-3xl">
                      {careerPaths[selectedCareerPath].description}
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedCareerPath(null)}
                  >
                    Back to All Paths
                  </Button>
                </div>

                {/* Salary Information */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <Card className="p-4 bg-green-500/10 border-green-500/20">
                    <div className="text-center">
                      <p className="text-sm text-green-400 mb-1">Entry Level (0-2 yrs)</p>
                      <p className="text-2xl font-bold text-green-400">
                        {careerPaths[selectedCareerPath].salary.fresher}
                      </p>
                    </div>
                  </Card>
                  <Card className="p-4 bg-blue-500/10 border-blue-500/20">
                    <div className="text-center">
                      <p className="text-sm text-blue-400 mb-1">Mid Level (2-5 yrs)</p>
                      <p className="text-2xl font-bold text-blue-400">
                        {careerPaths[selectedCareerPath].salary.midLevel}
                      </p>
                    </div>
                  </Card>
                  <Card className="p-4 bg-purple-500/10 border-purple-500/20">
                    <div className="text-center">
                      <p className="text-sm text-purple-400 mb-1">Senior Level (5+ yrs)</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {careerPaths[selectedCareerPath].salary.senior}
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Learning Roadmap */}
                <div className="space-y-6">
                  <h4 className="text-xl font-bold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Learning Roadmap
                  </h4>
                  
                  <div className="space-y-4">
                    {careerPaths[selectedCareerPath].roadmap.map((stage, index) => (
                      <Card key={index} className="p-4 border-border/40">
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-lg mb-2">{stage.stage}</h5>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <h6 className="font-medium mb-2 text-sm text-muted-foreground">Skills to Learn:</h6>
                                <div className="flex flex-wrap gap-2">
                                  {stage.skills.map((skill, skillIndex) => (
                                    <Badge key={skillIndex} variant="secondary" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h6 className="font-medium mb-2 text-sm text-muted-foreground">Recommended Resources:</h6>
                                <ul className="text-sm space-y-1">
                                  {stage.resources.map((resource, resourceIndex) => (
                                    <li key={resourceIndex} className="flex items-center gap-2">
                                      <BookOpen className="w-3 h-3 text-primary" />
                                      {resource}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Job Opportunities */}
                  <div>
                    <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Top Companies Hiring in India
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {careerPaths[selectedCareerPath].companies.map((company, index) => (
                        <Badge key={index} variant="outline" className="text-sm py-1">
                          {company}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-4">
                    <Button variant="hero" onClick={() => setActiveTab("courses")}>
                      <BookOpen className="w-4 h-4 mr-2" />
                      Explore Relevant Courses
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab("ai-mentor")}>
                      <Bot className="w-4 h-4 mr-2" />
                      Get Personalized Advice
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/code-editor")}>
                      <Code className="w-4 h-4 mr-2" />
                      Practice Coding
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Daily Challenges Tab */}
          <TabsContent value="challenges" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Code2 className="w-6 h-6 text-green-500" />
                Daily Programming Challenges
              </h2>
              <Badge variant="secondary">
                <CalendarDays className="w-4 h-4 mr-1" />
                {new Date().toLocaleDateString()}
              </Badge>
            </div>

            <div className="grid gap-6">
              {dailyChallenges.map((challenge) => (
                <Card key={challenge.id} className="p-6 border-border/40 bg-card/30 backdrop-blur">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{challenge.title}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getDifficultyColor(challenge.difficulty)}>
                          {challenge.difficulty}
                        </Badge>
                        <Badge variant="outline" className={getCategoryColor(challenge.category)}>
                          {getCategoryIcon(challenge.category)}
                          {challenge.category}
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      variant="hero"
                      onClick={() => navigate('/code-editor', { 
                        state: { 
                          challenge: challenge,
                          template: challenge.solution_template 
                        } 
                      })}
                    >
                      <Code className="w-4 h-4 mr-2" />
                      Solve Challenge
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Problem Statement</h4>
                      <p className="text-muted-foreground whitespace-pre-wrap">{challenge.problem_statement}</p>
                    </div>
                    
                    {challenge.test_cases && (
                      <div>
                        <h4 className="font-semibold mb-2">Test Cases</h4>
                        <pre className="bg-muted/50 p-3 rounded-lg text-sm overflow-x-auto">
                          {challenge.test_cases}
                        </pre>
                      </div>
                    )}
                    
                    {challenge.solution_template && (
                      <div>
                        <h4 className="font-semibold mb-2">Starter Code</h4>
                        <pre className="bg-muted/50 p-3 rounded-lg text-sm overflow-x-auto">
                          {challenge.solution_template}
                        </pre>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {dailyChallenges.length === 0 && (
              <Card className="p-12 text-center border-border/40 bg-card/30 backdrop-blur">
                <Code2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium mb-2">No challenges for today</p>
                <p className="text-muted-foreground mb-4">
                  Check back tomorrow for new programming challenges!
                </p>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/code-editor')}
                >
                  Practice in Code Editor
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* Programming Quiz Tab */}
          <TabsContent value="quiz" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-purple-500" />
                Programming Language Quiz
              </h2>
              <Badge variant="secondary">
                Test Your Knowledge
              </Badge>
            </div>

            {!quizStarted ? (
              <Card className="p-6 border-border/40 bg-card/30 backdrop-blur">
                <h3 className="text-xl font-bold mb-4">Select a Programming Language</h3>
                <p className="text-muted-foreground mb-6">
                  Choose a programming language to test your knowledge with 30+ comprehensive questions.
                </p>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {programmingLanguages.map((language) => (
                    <Button
                      key={language.id}
                      variant="outline"
                      className="h-auto py-4 flex flex-col gap-2"
                      onClick={() => startQuiz(language.id)}
                    >
                      {language.icon}
                      <span>{language.name}</span>
                    </Button>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h4 className="font-semibold text-blue-400 mb-2">Quiz Features:</h4>
                  <ul className="text-sm text-blue-300 space-y-1">
                    <li>• 30+ comprehensive questions per language</li>
                    <li>• Detailed explanations for each answer</li>
                    <li>• Track your progress and scores</li>
                    <li>• Earn achievements for high scores</li>
                  </ul>
                </div>
              </Card>
            ) : quizCompleted ? (
              <Card className="p-6 border-border/40 bg-card/30 backdrop-blur">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Quiz Completed!</h3>
                  <p className="text-muted-foreground mb-4">
                    You scored {quizScore} out of {currentQuiz?.length} in {programmingLanguages.find(l => l.id === selectedLanguage)?.name}
                  </p>
                  
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                    <div 
                      className="bg-green-500 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${(quizScore / currentQuiz.length) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-center gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">{quizScore}</div>
                      <div className="text-sm text-muted-foreground">Correct</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-500">{currentQuiz.length - quizScore}</div>
                      <div className="text-sm text-muted-foreground">Incorrect</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">
                        {Math.round((quizScore / currentQuiz.length) * 100)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Score</div>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-center">
                    <Button onClick={restartQuiz} variant="outline">
                      Take Another Quiz
                    </Button>
                    <Button onClick={() => setActiveTab("achievements")} variant="hero">
                      View Achievements
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-6 border-border/40 bg-card/30 backdrop-blur">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold">
                      {programmingLanguages.find(l => l.id === selectedLanguage)?.name} Quiz
                    </h3>
                    <p className="text-muted-foreground">
                      Question {currentQuestionIndex + 1} of {currentQuiz?.length}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    Score: {quizScore}
                  </Badge>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / currentQuiz.length) * 100}%` }}
                  ></div>
                </div>

                {currentQuiz && currentQuiz[currentQuestionIndex] && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold mb-4">
                        {currentQuiz[currentQuestionIndex].question}
                      </h4>
                      
                      <RadioGroup value={selectedAnswer} onValueChange={handleAnswerSelect} className="space-y-3">
                        {currentQuiz[currentQuestionIndex].options.map((option, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 border border-border/40 rounded-lg hover:bg-accent/5 transition-colors">
                            <RadioGroupItem value={option} id={`option-${index}`} />
                            <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="flex justify-between">
                      <Button 
                        variant="outline" 
                        onClick={handlePreviousQuestion}
                        disabled={currentQuestionIndex === 0}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>
                      
                      <Button onClick={handleNextQuestion} variant="hero">
                        {currentQuestionIndex === currentQuiz.length - 1 ? 'Finish Quiz' : 'Next Question'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Your Achievements
              </h2>
              <Badge variant="secondary">
                {userStats.achievements} / {achievements.length} Unlocked
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <Card 
                  key={achievement.id} 
                  className={`p-6 border-border/40 backdrop-blur transition-all duration-300 ${
                    achievement.earned 
                      ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30' 
                      : 'bg-card/30 border-border/40 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      achievement.earned 
                        ? 'bg-yellow-500/20 text-yellow-500' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {achievement.icon === 'trophy' && <Trophy className="w-6 h-6" />}
                      {achievement.icon === 'star' && <Star className="w-6 h-6" />}
                      {achievement.icon === 'zap' && <Zap className="w-6 h-6" />}
                      {achievement.icon === 'flame' && <Flame className="w-6 h-6" />}
                      {achievement.icon === 'target' && <TargetIcon className="w-6 h-6" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">{achievement.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {achievement.points} pts
                        </Badge>
                        {achievement.earned && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/50 text-xs">
                            Earned {new Date(achievement.earned_at).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {achievements.length === 0 && (
              <Card className="p-12 text-center border-border/40 bg-card/30 backdrop-blur">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium mb-2">No achievements available</p>
                <p className="text-muted-foreground">
                  Start learning to unlock achievements!
                </p>
              </Card>
            )}
          </TabsContent>

          {/* AI Career Mentor Tab */}
          <TabsContent value="ai-mentor" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Bot className="w-6 h-6 text-purple-500" />
                AI Career Mentor
              </h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={clearChat}>
                  Clear Chat
                </Button>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                  Powered by Gemini AI
                </Badge>
              </div>
            </div>

            <Card className="border-border/40 bg-card/30 backdrop-blur">
              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted border border-border/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {message.role === 'assistant' && (
                          <Bot className="w-4 h-4 text-purple-500" />
                        )}
                        <span className="text-sm font-medium">
                          {message.role === 'user' ? 'You' : 'Career Mentor'}
                        </span>
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-4 bg-muted border border-border/40">
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium">Career Mentor</span>
                      </div>
                      <div className="flex space-x-1 mt-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="border-t border-border/40 p-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Textarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me about career guidance, technical interviews, learning paths..."
                      className="min-h-[60px] resize-none pr-12 border-border/40 bg-background/50 backdrop-blur"
                      disabled={isLoading}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-2 top-2 h-8 w-8 p-0"
                      onClick={toggleSpeechRecognition}
                      disabled={isLoading}
                    >
                      {isListening ? (
                        <MicOff className="h-4 w-4 text-red-500" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!userInput.trim() || isLoading}
                    variant="hero"
                    className="self-end"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3 text-xs text-muted-foreground">
                  <span>Try asking:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => sendMessageToAI("What programming language should I learn for web development?")}
                    disabled={isLoading}
                  >
                    Best web dev language?
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => sendMessageToAI("How can I prepare for technical interviews?")}
                    disabled={isLoading}
                  >
                    Interview prep tips
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => sendMessageToAI("Suggest a learning path for data science")}
                    disabled={isLoading}
                  >
                    Data science roadmap
                  </Button>
                </div>
              </div>
            </Card>

            {/* Quick Tips */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-4 border-border/40 bg-card/30 backdrop-blur">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  <h4 className="font-semibold">Career Guidance</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Get personalized career advice based on your skills and interests
                </p>
              </Card>

              <Card className="p-4 border-border/40 bg-card/30 backdrop-blur">
                <div className="flex items-center gap-2 mb-2">
                  <Code className="w-4 h-4 text-green-500" />
                  <h4 className="font-semibold">Technical Help</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Code review, best practices, and technical interview preparation
                </p>
              </Card>

              <Card className="p-4 border-border/40 bg-card/30 backdrop-blur">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-purple-500" />
                  <h4 className="font-semibold">Learning Paths</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Customized learning roadmaps for different tech careers
                </p>
              </Card>
            </div>
          </TabsContent>

          {/* Management Tab - Only for Admins */}
          <TabsContent value="manage" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-500" />
                Admin Management
              </h2>
              <Badge variant="secondary">Admin Panel</Badge>
            </div>

            {isAdmin ? (
              <div className="space-y-6">
                {/* Add/Edit Course Form */}
                <Card id="course-management-form" className="p-6 border-border/40 bg-card/30 backdrop-blur">
                  <h3 className="text-xl font-bold mb-4">
                    {editingCourse ? 'Edit Course' : 'Add New Course'}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="course-title">Course Title *</Label>
                        <Input
                          id="course-title"
                          placeholder="Enter course title"
                          value={courseForm.title}
                          onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                          className="border-border/40 bg-background/50 backdrop-blur"
                        />
                      </div>
                      <div>
                        <Label htmlFor="course-description">Description *</Label>
                        <Textarea
                          id="course-description"
                          placeholder="Enter course description"
                          rows={3}
                          value={courseForm.description}
                          onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                          className="border-border/40 bg-background/50 backdrop-blur"
                        />
                      </div>
                      <div>
                        <Label htmlFor="course-category">Category *</Label>
                        <Select 
                          value={courseForm.category} 
                          onValueChange={(value) => setCourseForm({...courseForm, category: value})}
                        >
                          <SelectTrigger className="border-border/40 bg-background/50 backdrop-blur">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="web-development">Web Development</SelectItem>
                            <SelectItem value="programming">Programming</SelectItem>
                            <SelectItem value="data-science">Data Science</SelectItem>
                            <SelectItem value="mobile-development">Mobile Development</SelectItem>
                            <SelectItem value="algorithms">Algorithms</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="course-difficulty">Difficulty *</Label>
                        <Select 
                          value={courseForm.difficulty} 
                          onValueChange={(value) => setCourseForm({...courseForm, difficulty: value})}
                        >
                          <SelectTrigger className="border-border/40 bg-background/50 backdrop-blur">
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="course-duration">Duration (hours)</Label>
                        <Input
                          id="course-duration"
                          type="number"
                          placeholder="e.g., 10"
                          value={courseForm.duration_hours || ''}
                          onChange={(e) => setCourseForm({
                            ...courseForm, 
                            duration_hours: e.target.value ? parseInt(e.target.value) : null
                          })}
                          className="border-border/40 bg-background/50 backdrop-blur"
                        />
                      </div>
                      <div>
                        <Label htmlFor="course-thumbnail">Thumbnail URL</Label>
                        <Input
                          id="course-thumbnail"
                          placeholder="https://example.com/thumbnail.jpg"
                          value={courseForm.thumbnail_url}
                          onChange={(e) => setCourseForm({...courseForm, thumbnail_url: e.target.value})}
                          className="border-border/40 bg-background/50 backdrop-blur"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="course-trending" 
                          className="rounded" 
                          checked={courseForm.is_trending || false}
                          onChange={(e) => setCourseForm({...courseForm, is_trending: e.target.checked})}
                        />
                        <Label htmlFor="course-trending" className="cursor-pointer">
                          Mark as Trending
                        </Label>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      onClick={editingCourse ? updateExistingCourse : addNewCourse}
                      disabled={!courseForm.title || !courseForm.description || !courseForm.category || !courseForm.difficulty}
                      variant="hero"
                    >
                      {editingCourse ? 'Update Course' : 'Add Course'}
                    </Button>
                    {editingCourse && (
                      <Button 
                        variant="outline"
                        onClick={cancelEdit}
                      >
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </Card>

                {/* Add Video to Course Form */}
                <Card className="p-6 border-border/40 bg-card/30 backdrop-blur">
                  <h3 className="text-xl font-bold mb-4">Add Video to Course</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="video-course">Select Course *</Label>
                      <Select 
                        value={videoForm.course_id} 
                        onValueChange={(value) => setVideoForm({...videoForm, course_id: value})}
                      >
                        <SelectTrigger className="border-border/40 bg-background/50 backdrop-blur">
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                        <SelectContent>
                          {allCourses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="video-order">Order Index</Label>
                      <Input
                        id="video-order"
                        type="number"
                        placeholder="0"
                        value={videoForm.order_index}
                        onChange={(e) => setVideoForm({...videoForm, order_index: parseInt(e.target.value) || 0})}
                        className="border-border/40 bg-background/50 backdrop-blur"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="video-title">Video Title *</Label>
                      <Input
                        id="video-title"
                        placeholder="Enter video title"
                        value={videoForm.title}
                        onChange={(e) => setVideoForm({...videoForm, title: e.target.value})}
                        className="border-border/40 bg-background/50 backdrop-blur"
                      />
                    </div>
                    <div className="md-2">
                      <Label htmlFor="video-description">Description</Label>
                      <Textarea
                        id="video-description"
                        placeholder="Enter video description"
                        rows={2}
                        value={videoForm.description}
                        onChange={(e) => setVideoForm({...videoForm, description: e.target.value})}
                        className="border-border/40 bg-background/50 backdrop-blur"
                      />
                    </div>
                    <div>
                      <Label htmlFor="video-url">Video URL *</Label>
                      <Input
                        id="video-url"
                        placeholder="https://youtube.com/watch?v=..."
                        value={videoForm.url}
                        onChange={(e) => setVideoForm({...videoForm, url: e.target.value})}
                        className="border-border/40 bg-background/50 backdrop-blur"
                      />
                    </div>
                    <div>
                      <Label htmlFor="video-duration">Duration</Label>
                      <Input
                        id="video-duration"
                        placeholder="e.g., 15:30"
                        value={videoForm.duration}
                        onChange={(e) => setVideoForm({...videoForm, duration: e.target.value})}
                        className="border-border/40 bg-background/50 backdrop-blur"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={addVideoToCourse}
                    disabled={!videoForm.title || !videoForm.url || !videoForm.course_id}
                    variant="hero"
                    className="mt-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Video to Course
                  </Button>
                </Card>

                {/* Add Daily Challenge Form */}
                <Card className="p-6 border-border/40 bg-card/30 backdrop-blur">
                  <h3 className="text-xl font-bold mb-4">Add Daily Challenge</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="challenge-title">Challenge Title *</Label>
                      <Input
                        id="challenge-title"
                        placeholder="Enter challenge title"
                        value={challengeForm.title}
                        onChange={(e) => setChallengeForm({...challengeForm, title: e.target.value})}
                        className="border-border/40 bg-background/50 backdrop-blur"
                      />
                    </div>
                    <div>
                      <Label htmlFor="challenge-difficulty">Difficulty *</Label>
                      <Select 
                        value={challengeForm.difficulty} 
                        onValueChange={(value) => setChallengeForm({...challengeForm, difficulty: value})}
                      >
                        <SelectTrigger className="border-border/40 bg-background/50 backdrop-blur">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="challenge-category">Category *</Label>
                      <Select 
                        value={challengeForm.category} 
                        onValueChange={(value) => setChallengeForm({...challengeForm, category: value})}
                      >
                        <SelectTrigger className="border-border/40 bg-background/50 backdrop-blur">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="programming">Programming</SelectItem>
                          <SelectItem value="algorithms">Algorithms</SelectItem>
                          <SelectItem value="data-structures">Data Structures</SelectItem>
                          <SelectItem value="web-development">Web Development</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="challenge-description">Description</Label>
                      <Textarea
                        id="challenge-description"
                        placeholder="Enter challenge description"
                        rows={2}
                        value={challengeForm.description}
                        onChange={(e) => setChallengeForm({...challengeForm, description: e.target.value})}
                        className="border-border/40 bg-background/50 backdrop-blur"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="challenge-problem">Problem Statement *</Label>
                      <Textarea
                        id="challenge-problem"
                        placeholder="Enter the problem statement..."
                        rows={4}
                        value={challengeForm.problem_statement}
                        onChange={(e) => setChallengeForm({...challengeForm, problem_statement: e.target.value})}
                        className="border-border/40 bg-background/50 backdrop-blur font-mono text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="challenge-test-cases">Test Cases</Label>
                      <Textarea
                        id="challenge-test-cases"
                        placeholder="Enter test cases (JSON format recommended)"
                        rows={3}
                        value={challengeForm.test_cases}
                        onChange={(e) => setChallengeForm({...challengeForm, test_cases: e.target.value})}
                        className="border-border/40 bg-background/50 backdrop-blur font-mono text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="challenge-template">Solution Template *</Label>
                      <Textarea
                        id="challenge-template"
                        placeholder="Enter starter code template"
                        rows={6}
                        value={challengeForm.solution_template}
                        onChange={(e) => setChallengeForm({...challengeForm, solution_template: e.target.value})}
                        className="border-border/40 bg-background/50 backdrop-blur font-mono text-sm"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={addDailyChallenge}
                    disabled={!challengeForm.title || !challengeForm.problem_statement || !challengeForm.solution_template}
                    variant="hero"
                    className="mt-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Daily Challenge
                  </Button>
                </Card>

                {/* Existing Courses List */}
                <Card className="p-6 border-border/40 bg-card/30 backdrop-blur">
                  <h3 className="text-xl font-bold mb-4">Manage Courses</h3>
                  <div className="space-y-4">
                    {allCourses.map((course) => (
                      <div key={course.id} className="flex items-center justify-between p-4 border border-border/40 rounded-lg">
                        <div className="flex items-center gap-4">
                          <img 
                            src={course.thumbnail_url} 
                            alt={course.title}
                            className="w-16 h-16 rounded-lg object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/64/3B82F6/FFFFFF?text=Course';
                            }}
                          />
                          <div>
                            <h4 className="font-semibold">{course.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{course.category}</Badge>
                              <Badge className={getDifficultyColor(course.difficulty)}>
                                {course.difficulty}
                              </Badge>
                              {course.is_trending && (
                                <Badge variant="default" className="bg-orange-500">
                                  Trending
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => editCourse(course)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={async () => {
                              if (confirm("Are you sure you want to delete this course?")) {
                                await deleteCourse(course.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="p-8 text-center border-border/40 bg-card/30 backdrop-blur">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium mb-2">Admin Access Required</p>
                <p className="text-muted-foreground">
                  You need administrator privileges to access course management.
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Missing icon components
const Coffee = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 5V3a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1zM4 11h13a2 2 0 0 1 2 2v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-1z"/>
  </svg>
);

const Android = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.3-.16-.68-.04-.84.26L16.6 8.2c-1.3-.5-2.7-.8-4.2-.8s-2.9.3-4.2.8L5.66 5.71c-.16-.3-.54-.42-.84-.26-.3.16-.42.54-.26.85L6.4 9.48C3.3 11.25 1 14.5 1 18c0 3.3 2.7 6 6 6h10c3.3 0 6-2.7 6-6 0-3.5-2.3-6.75-5.4-8.52zM7 15.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm10 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z"/>
  </svg>
);

const Server = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 9V5h14v4H5zm14 4H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2zM5 19v-4h14v4H5z"/>
  </svg>
);

const Gem = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.2 3.5L12 7.7 7.8 3.5 3.5 7.8 7.7 12l-4.2 4.2 4.2 4.2 4.2-4.2 4.2 4.2 4.2-4.2L16.3 12l4.2-4.2-4.2-4.3z"/>
  </svg>
);

const Layout = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 19V5h4v14H5zm10 0h4V5h-4v14z"/>
  </svg>
);

export default Dashboard;