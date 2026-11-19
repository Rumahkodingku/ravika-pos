#define AppName "RAVIKA POS"
#define AppVersion "1.0.0"
#define ServiceId "RAVIKA_POS"

[Setup]
AppId={{4E7B0C8F-7C1A-45A7-9E56-RAVIKAPOS10}
AppName={#AppName}
AppVersion={#AppVersion}
DefaultDirName={autopf}\RAVIKA POS
DefaultGroupName=RAVIKA POS
DisableProgramGroupPage=yes
PrivilegesRequired=admin
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
OutputDir=..\release
OutputBaseFilename=ravika-pos-windows-{#AppVersion}
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
UninstallDisplayName={#AppName}

[Files]
Source: "..\.next\standalone\*"; DestDir: "{app}\app"; Flags: recursesubdirs createallsubdirs ignoreversion
Source: "runtime\node.exe"; DestDir: "{app}\runtime"; Flags: ignoreversion
Source: "ravika-pos-service.xml"; DestDir: "{app}\service"; Flags: ignoreversion
Source: "winsw.exe"; DestDir: "{app}\service"; DestName: "ravika-pos-service.exe"; Flags: ignoreversion
Source: "..\scripts\windows\start.mjs"; DestDir: "{app}\service"; Flags: ignoreversion
Source: "..\scripts\windows\pre-upgrade-backup.mjs"; DestDir: "{app}\scripts"; Flags: ignoreversion

[Dirs]
Name: "{commonappdata}\RAVIKA POS\data"; Permissions: users-modify
Name: "{commonappdata}\RAVIKA POS\config"; Permissions: users-modify
Name: "{commonappdata}\RAVIKA POS\backups"; Permissions: users-modify
Name: "{commonappdata}\RAVIKA POS\logs"; Permissions: users-modify

[Run]
Filename: "{app}\service\ravika-pos-service.exe"; Parameters: "install"; Flags: runhidden waituntilterminated
Filename: "{sys}\sc.exe"; Parameters: "config {#ServiceId} obj= ""NT SERVICE\RAVIKA_POS"""; Flags: runhidden waituntilterminated
Filename: "{sys}\icacls.exe"; Parameters: """{commonappdata}\RAVIKA POS"" /grant ""NT SERVICE\RAVIKA_POS:(OI)(CI)M"" /T"; Flags: runhidden waituntilterminated
Filename: "{sys}\netsh.exe"; Parameters: "advfirewall firewall delete rule name=""RAVIKA POS HTTP"""; Flags: runhidden waituntilterminated
Filename: "{sys}\netsh.exe"; Parameters: "advfirewall firewall add rule name=""RAVIKA POS HTTP"" dir=in action=allow protocol=TCP localport=3000 remoteip=LocalSubnet profile=any"; Flags: runhidden waituntilterminated
Filename: "{sys}\netsh.exe"; Parameters: "advfirewall firewall delete rule name=""RAVIKA POS mDNS"""; Flags: runhidden waituntilterminated
Filename: "{sys}\netsh.exe"; Parameters: "advfirewall firewall add rule name=""RAVIKA POS mDNS"" dir=in action=allow protocol=UDP localport=5353 remoteip=LocalSubnet profile=any"; Flags: runhidden waituntilterminated
Filename: "{app}\service\ravika-pos-service.exe"; Parameters: "start"; Flags: runhidden waituntilterminated
Filename: "http://127.0.0.1:3000/setup"; Flags: shellexec nowait postinstall skipifsilent

[UninstallRun]
Filename: "{app}\service\ravika-pos-service.exe"; Parameters: "stop"; Flags: runhidden waituntilterminated; RunOnceId: "StopRavika"
Filename: "{app}\service\ravika-pos-service.exe"; Parameters: "uninstall"; Flags: runhidden waituntilterminated; RunOnceId: "UninstallRavika"
Filename: "{sys}\netsh.exe"; Parameters: "advfirewall firewall delete rule name=""RAVIKA POS HTTP"""; Flags: runhidden waituntilterminated; RunOnceId: "RemoveHttpRule"
Filename: "{sys}\netsh.exe"; Parameters: "advfirewall firewall delete rule name=""RAVIKA POS mDNS"""; Flags: runhidden waituntilterminated; RunOnceId: "RemoveMdnsRule"

[Code]
function DbExists(): Boolean;
begin
  Result := FileExists(ExpandConstant('{commonappdata}\RAVIKA POS\data\ravika.sqlite'));
end;

function PrepareUpgrade(): Boolean;
var
  ResultCode: Integer;
begin
  Result := True;

  if not DbExists() then
    Exit;

  Exec(ExpandConstant('{sys}\sc.exe'), 'stop {#ServiceId}', '', SW_HIDE,
    ewWaitUntilTerminated, ResultCode);

  DelTree(ExpandConstant('{app}.previous'), True, True, True);

  if DirExists(ExpandConstant('{app}')) then
  begin
    Exec(ExpandConstant('{sys}\xcopy.exe'),
      '"' + ExpandConstant('{app}') + '" "' + ExpandConstant('{app}.previous') + '" /E /I /Y',
      '', SW_HIDE, ewWaitUntilTerminated, ResultCode);

    if ResultCode > 1 then
    begin
      Exec(ExpandConstant('{app}\service\ravika-pos-service.exe'), 'start', '',
        SW_HIDE, ewWaitUntilTerminated, ResultCode);
      MsgBox('Cadangan aplikasi lama gagal dibuat. Instalasi dibatalkan.', mbError, MB_OK);
      Result := False;
      Exit;
    end;
  end;

  Exec(ExpandConstant('{app}\runtime\node.exe'),
    '"' + ExpandConstant('{app}\scripts\pre-upgrade-backup.mjs') + '"',
    '', SW_HIDE, ewWaitUntilTerminated, ResultCode);

  if ResultCode <> 0 then
  begin
    Exec(ExpandConstant('{app}\service\ravika-pos-service.exe'), 'start', '',
      SW_HIDE, ewWaitUntilTerminated, ResultCode);
    MsgBox('Backup database sebelum upgrade gagal. Instalasi dibatalkan.', mbError, MB_OK);
    Result := False;
  end;
end;

procedure RollbackUpgrade();
var
  ResultCode: Integer;
  BackupFile: String;
  DbFile: String;
begin
  Exec(ExpandConstant('{sys}\sc.exe'), 'stop {#ServiceId}', '', SW_HIDE,
    ewWaitUntilTerminated, ResultCode);

  if DirExists(ExpandConstant('{app}.previous')) then
    Exec(ExpandConstant('{sys}\xcopy.exe'),
      '"' + ExpandConstant('{app}.previous') + '" "' + ExpandConstant('{app}') + '" /E /I /Y',
      '', SW_HIDE, ewWaitUntilTerminated, ResultCode);

  BackupFile := ExpandConstant('{commonappdata}\RAVIKA POS\backups\ravika-pre-upgrade.sqlite');
  DbFile := ExpandConstant('{commonappdata}\RAVIKA POS\data\ravika.sqlite');

  if FileExists(BackupFile) then
  begin
    DeleteFile(DbFile + '-wal');
    DeleteFile(DbFile + '-shm');
    CopyFile(BackupFile, DbFile, False);
  end;

  Exec(ExpandConstant('{app}\service\ravika-pos-service.exe'), 'start', '',
    SW_HIDE, ewWaitUntilTerminated, ResultCode);

  MsgBox('Upgrade gagal. Aplikasi dan database sudah dikembalikan ke versi sebelumnya.', mbError, MB_OK);
end;

function HealthCheck(): Boolean;
var
  ResultCode: Integer;
begin
  Exec(ExpandConstant('{sys}\WindowsPowerShell\v1.0\powershell.exe'),
    '-NoProfile -NonInteractive -Command "try { (Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3000/api/health -TimeoutSec 10).StatusCode -eq 200 } catch { exit 1 }"',
    '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  Result := ResultCode = 0;
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssInstall then
    if not PrepareUpgrade() then
      Abort;

  if CurStep = ssDone then
  begin
    if HealthCheck() then
      DelTree(ExpandConstant('{app}.previous'), True, True, True)
    else
      RollbackUpgrade();
  end;
end;

procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
begin
  if CurUninstallStep = usPostUninstall then
    MsgBox('Data bisnis di C:\ProgramData\RAVIKA POS tidak dihapus.', mbInformation, MB_OK);
end;