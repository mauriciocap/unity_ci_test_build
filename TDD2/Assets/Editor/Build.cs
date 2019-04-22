//En Jenkings ejecuto asi
// -quit -batchmode -executeMethod Build.PerformWindows -projectPath E:\0mau\devel\unity\TDD2\TDD2 -runEditorTests -logFile e:\tmp\build\unity.log
// notar que use logFile porque eso busca el plugin para saber de donde leer el log
//VER: https://github.com/jenkinsci/unity3d-plugin/blob/master/src/main/java/org/jenkinsci/plugins/unity3d/Unity3dBuilder.java#L201
//Lo vamos a llamar con -executeMethod <ClassName.MethodName>
//VER: https://docs.unity3d.com/Manual/CommandLineArguments.html

//VER: https://unity3d.com/de/learn/tutorials/topics/interface-essentials/unity-editor-extensions-menu-items
//VER: https://docs.unity3d.com/ScriptReference/BuildPipeline.BuildPlayer.html
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using UnityEditor.Build.Reporting;


class Build 
{
    static string[] SCENES = FindEnabledEditorScenes();

    static string APP_NAME = "com.mauriciocap.BuildTest";
    static string TARGET_DIR = "e:/tmp/build";
 
    [MenuItem("Custom/CI/Build Android")]
    static void PerformAndroid()
    {
        string target_dir = APP_NAME + ".apk";
        GenericBuild(SCENES, TARGET_DIR + "/android/" + target_dir, BuildTargetGroup.Android, BuildTarget.Android, BuildOptions.None);
    }

    [MenuItem("Custom/CI/Build Windows")]
    static void PerformWindows()
    {
        string target_dir = APP_NAME + ".exe";
        GenericBuild(SCENES, TARGET_DIR + "/windows/" + target_dir, BuildTargetGroup.WSA ,BuildTarget.StandaloneWindows, BuildOptions.None);
    }

    private static string[] FindEnabledEditorScenes()
    {
        List<string> EditorScenes = new List<string>();
        foreach (EditorBuildSettingsScene scene in EditorBuildSettings.scenes)
        {
            if (!scene.enabled) continue;
            EditorScenes.Add(scene.path);
        }
        return EditorScenes.ToArray();
    }

    static void GenericBuild(string[] scenes, string target_dir, BuildTargetGroup build_target_group, BuildTarget build_target, BuildOptions build_options)
    {
        EditorUserBuildSettings.SwitchActiveBuildTarget(build_target_group, build_target);
        BuildReport resreport = BuildPipeline.BuildPlayer(scenes, target_dir, build_target, build_options);
        BuildSummary ressummary = resreport.summary;
        if (ressummary.result== BuildResult.Failed)
        {
            throw new Exception("BuildPlayer failure: " + ressummary.totalErrors);
        }
    }
}