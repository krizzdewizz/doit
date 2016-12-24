; https://autohotkey.com/boards/viewtopic.php?t=4357

Args( CmdLine := "", Skip := 0 ) {     ; By SKAN,  http://goo.gl/JfMNpN,  CD:23/Aug/2014 | MD:24/Aug/2014
  Local pArgs := 0, nArgs := 0, A := []

  pArgs := DllCall( "Shell32\CommandLineToArgvW", "WStr",CmdLine, "PtrP",nArgs, "Ptr" )

  Loop % ( nArgs )
     If ( A_Index > Skip )
       A[ A_Index - Skip ] := StrGet( NumGet( ( A_Index - 1 ) * A_PtrSize + pArgs ), "UTF-16" )

Return A,   A[0] := nArgs - Skip,   DllCall( "LocalFree", "Ptr",pArgs )
}

#Warn
#SingleInstance, Force

CmdLine := DllCall( "GetCommandLine", "Str" )
Skip    := ( A_IsCompiled ? 1 : 2 )

argv    := Args( CmdLine, Skip )

file := SubStr(argv[1], StrLen("doit-open:") + 1)
;FileAppend, % "Count = " argv[0] "`n1=" argv[1] "`n2=" argv[2] "`n3=" argv[3] "`n4=" argv[4], d:\data\doit\client\doit-open-log.txt
;FileAppend, % file, d:\data\doit\client\doit-open-log.txt
Run, % file
