Add-Type -AssemblyName System.Windows.Forms
Add-Type -Namespace User32 -Name NativeMethods -MemberDefinition @'
    [DllImport("user32.dll")]
    public static extern bool SetCursorPos(int X, int Y);
    
    [DllImport("user32.dll")]
    public static extern void mouse_event(int dwFlags, int dx, int dy, int dwData, int dwExtraInfo);
'@

# Costanti per i click del mouse
$MOUSEEVENTF_LEFTDOWN = 0x02
$MOUSEEVENTF_LEFTUP = 0x04

# Coordinata X e Y - SOSTITUISCI con quelle desiderate
$x = £x
$y = £y

# Sposta il cursore
[User32.NativeMethods]::SetCursorPos($x, $y)

# Pausa facoltativa (es. per assicurarsi che il cursore sia arrivato)
Start-Sleep -Milliseconds 200

# Click sinistro
[User32.NativeMethods]::mouse_event($MOUSEEVENTF_LEFTDOWN, $x, $y, 0, 0)
[User32.NativeMethods]::mouse_event($MOUSEEVENTF_LEFTUP, $x, $y, 0, 0)
