import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Play, 
  Save, 
  Trash2, 
  ArrowLeft, 
  FileText, 
  Code2, 
  Terminal,
  User,
  LogOut,
  FolderOpen,
  Plus,
  Download,
  Upload
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const CodeEditor = () => {
  const [code, setCode] = useState<string>(`# Welcome to FutureLearnX Code Editor!
# Write and execute code in multiple languages

def factorial(n):
    if n == 0:
        return 1
    else:
        return n * factorial(n-1)

def main():
    print("Factorial of 5 is:", factorial(5))
    print("Hello from FutureLearnX IDE!")

if __name__ == "__main__":
    main()`);
  
  const [output, setOutput] = useState<string>("Output will appear here after execution...");
  const [language, setLanguage] = useState<string>("python");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("main.py");
  const [user, setUser] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [activeFile, setActiveFile] = useState<string>("main.py");
  const [activeTab, setActiveTab] = useState<string>("editor");
  const navigate = useNavigate();
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const languageVersions = {
    'python': '3.10.0',
    'javascript': '18.15.0',
    'java': '15.0.2',
    'cpp': '10.2.0',
    'rust': '1.68.2',
    'go': '1.18.0'
  };

  const fileExtensions = {
    'python': 'py',
    'javascript': 'js',
    'java': 'java',
    'cpp': 'cpp',
    'rust': 'rs',
    'go': 'go'
  };

  const sampleCode = {
    'python': `# Python example
def factorial(n):
    if n == 0:
        return 1
    else:
        return n * factorial(n-1)

print("Factorial of 5 is:", factorial(5))`,
    'javascript': `// JavaScript example
function factorial(n) {
    if (n === 0) return 1;
    return n * factorial(n - 1);
}

console.log("Factorial of 5 is:", factorial(5));`,
    'java': `// Java example
public class Main {
    public static void main(String[] args) {
        System.out.println("Factorial of 5 is: " + factorial(5));
    }
    
    public static int factorial(int n) {
        if (n == 0) return 1;
        return n * factorial(n - 1);
    }
}`,
    'cpp': `// C++ example
#include <iostream>
using namespace std;

int factorial(int n) {
    if (n == 0) return 1;
    return n * factorial(n - 1);
}

int main() {
    cout << "Factorial of 5 is: " << factorial(5) << endl;
    return 0;
}`,
    'rust': `// Rust example
fn factorial(n: u32) -> u32 {
    match n {
        0 => 1,
        _ => n * factorial(n - 1)
    }
}

fn main() {
    println!("Factorial of 5 is: {}", factorial(5));
}`,
    'go': `// Go example
package main

import "fmt"

func factorial(n int) int {
    if n == 0 {
        return 1
    }
    return n * factorial(n-1)
}

func main() {
    fmt.Printf("Factorial of 5 is: %d\\n", factorial(5))
}`
  };

  useEffect(() => {
    checkUser();
    loadUserFiles();
  }, []);

  useEffect(() => {
    updateFileName();
  }, [language]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const loadUserFiles = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("code_files")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error("Error loading files:", error);
    }
  };

  const updateFileName = () => {
    const baseName = fileName.split('.')[0];
    const ext = fileExtensions[language] || 'txt';
    setFileName(`${baseName}.${ext}`);
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      setOutput("Please write some code first!");
      return;
    }

    setIsRunning(true);
    setOutput("Executing code...");

    try {
      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: language,
          version: languageVersions[language],
          files: [
            {
              name: fileName,
              content: code
            }
          ]
        })
      });

      const data = await response.json();

      if (data.run) {
        let outputText = '';
        
        if (data.run.stdout) {
          outputText += data.run.stdout;
        }
        
        if (data.run.stderr) {
          outputText += (outputText ? '\n' : '') + data.run.stderr;
        }
        
        if (data.run.output) {
          outputText = data.run.output;
        }
        
        setOutput(outputText || "Code executed successfully but produced no output.");
        toast.success("Code executed successfully!");
      } else {
        setOutput("Execution failed. Please try again.");
        toast.error("Execution failed");
      }
    } catch (error) {
      console.error('Execution error:', error);
      setOutput("Error executing code. Please check your connection and try again.");
      toast.error("Error executing code");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveFile = async () => {
    if (!user) {
      toast.error("Please sign in to save files");
      return;
    }

    try {
      const { error } = await supabase
        .from("code_files")
        .upsert({
          user_id: user.id,
          file_name: fileName,
          content: code,
          language: language,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success("File saved successfully!");
      loadUserFiles();
    } catch (error) {
      console.error("Error saving file:", error);
      toast.error("Failed to save file");
    }
  };

  const handleNewFile = () => {
    setCode(sampleCode[language] || "");
    setFileName(`new_file.${fileExtensions[language]}`);
    setOutput("Output will appear here after execution...");
    toast.info("New file created");
  };

  const handleClear = () => {
    setCode("");
    setOutput("Editor cleared");
  };

  const handleLoadFile = (file: any) => {
    setCode(file.content);
    setFileName(file.file_name);
    setLanguage(file.language);
    setOutput("File loaded successfully");
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setCode(sampleCode[newLanguage] || "");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/5">
      {/* Header */}
      <header className="backdrop-blur-lg bg-background/80 border-b border-primary/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="FutureLearnX" className="w-10 h-10" />
            <span className="text-2xl font-bold text-gradient">FutureLearnX Code Editor</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            {user && (
              <Button variant="ghost" onClick={() => navigate("/profile")}>
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            )}
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Info */}
            <Card className="p-6 card-glow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  {user?.email?.charAt(0).toUpperCase() || "G"}
                </div>
                <div>
                  <p className="font-semibold">{user?.email || "Guest User"}</p>
                  <Badge variant={user ? "default" : "secondary"}>
                    {user ? "Signed In" : "Not Signed In"}
                  </Badge>
                </div>
              </div>
              {!user && (
                <Button 
                  className="w-full" 
                  onClick={() => navigate("/auth")}
                >
                  Sign In to Save Files
                </Button>
              )}
            </Card>

            {/* File Management */}
            <Card className="p-6 card-glow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <FolderOpen className="w-5 h-5" />
                  Your Files
                </h3>
                <Button variant="outline" size="sm" onClick={handleNewFile}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-accent/50 ${
                      activeFile === file.file_name ? 'bg-primary/20 border-primary' : 'border-border'
                    }`}
                    onClick={() => handleLoadFile(file)}
                  >
                    <div className="flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium truncate">{file.file_name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs mt-1">
                      {file.language}
                    </Badge>
                  </div>
                ))}
                
                {files.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No files saved yet
                  </p>
                )}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 card-glow">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={handleNewFile}>
                  New File
                </Button>
                <Button variant="outline" size="sm" onClick={handleSaveFile}>
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={handleClear}>
                  Clear
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(code)}>
                  Copy Code
                </Button>
              </div>
            </Card>
          </div>

          {/* Main Editor Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Controls */}
            <Card className="p-6 card-glow">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="File name"
                  />
                </div>
                
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                    <SelectItem value="rust">Rust</SelectItem>
                    <SelectItem value="go">Go</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  onClick={handleRunCode} 
                  disabled={isRunning}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isRunning ? "Running..." : "Run Code"}
                </Button>

                <Button onClick={handleSaveFile} variant="outline">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>

                <Button onClick={handleClear} variant="outline">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </Card>

            {/* Editor and Output Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="editor" className="flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  Code Editor
                </TabsTrigger>
                <TabsTrigger value="output" className="flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  Output
                </TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="space-y-4">
                <Card className="p-0 card-glow overflow-hidden">
                  <textarea
                    ref={editorRef}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-96 font-mono text-sm p-4 resize-none focus:outline-none bg-background"
                    spellCheck={false}
                  />
                </Card>
              </TabsContent>

              <TabsContent value="output" className="space-y-4">
                <Card className="p-0 card-glow overflow-hidden">
                  <pre className="w-full h-96 font-mono text-sm p-4 overflow-auto bg-secondary/20">
                    {output}
                  </pre>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-4 text-center card-glow">
                <Code2 className="w-8 h-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold">Multi-Language</h4>
                <p className="text-sm text-muted-foreground">Python, JS, Java, C++, Rust, Go</p>
              </Card>
              
              <Card className="p-4 text-center card-glow">
                <Play className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-semibold">Instant Execution</h4>
                <p className="text-sm text-muted-foreground">Run code in secure sandbox</p>
              </Card>
              
              <Card className="p-4 text-center card-glow">
                <Save className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h4 className="font-semibold">Cloud Save</h4>
                <p className="text-sm text-muted-foreground">Save and access from anywhere</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;