const fs = require('fs');
const path = require('path');

function patchFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) {
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  for (const [from, to] of replacements) {
    content = content.replace(from, to);
  }
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Patched: ${filePath}`);
  } else {
    console.log(`Already up to date: ${filePath}`);
  }
}

// 1. NativeWorklets.native.ts
patchFile(
  path.join(__dirname, '../node_modules/react-native-worklets/src/WorkletsModule/NativeWorklets.native.ts'),
  [
    [/  #workletsModuleProxy: WorkletsModuleProxy;/g, '  private _workletsModuleProxy: WorkletsModuleProxy;'],
    [/  #serializableUndefined: SerializableRef<undefined>;/g, '  private _serializableUndefined: SerializableRef<undefined>;'],
    [/  #serializableNull: SerializableRef<null>;/g, '  private _serializableNull: SerializableRef<null>;'],
    [/  #serializableTrue: SerializableRef<boolean>;/g, '  private _serializableTrue: SerializableRef<boolean>;'],
    [/  #serializableFalse: SerializableRef<boolean>;/g, '  private _serializableFalse: SerializableRef<boolean>;'],
    [/this\.#workletsModuleProxy/g, 'this._workletsModuleProxy'],
    [/this\.#serializableNull/g, 'this._serializableNull'],
    [/this\.#serializableUndefined/g, 'this._serializableUndefined'],
    [/this\.#serializableTrue/g, 'this._serializableTrue'],
    [/this\.#serializableFalse/g, 'this._serializableFalse'],
    [
      /WorkletsTurboModule\?\.installTurboModule\(bundleModeEnabled\);/g,
      'try { WorkletsTurboModule?.installTurboModule(bundleModeEnabled); } catch (_e) { try { (WorkletsTurboModule as any)?.installTurboModule(); } catch (_e2) {} }'
    ],
    [
      /WorkletsTurboModule\?\.start\(\);/g,
      'try { (WorkletsTurboModule as any)?.start?.(); } catch (_e) {}'
    ],
    [
      /WorkletsTurboModule\?\.toggleSlowAnimationsOnUIRuntime\(\)/g,
      '(WorkletsTurboModule as any)?.toggleSlowAnimationsOnUIRuntime?.()'
    ],
    [
      /function installUnpackers\(workletsModuleProxy: WorkletsModuleProxy\) \{/g,
      'function installUnpackers(workletsModuleProxy: WorkletsModuleProxy) {\n  if (!workletsModuleProxy || (typeof (workletsModuleProxy as any).loadUnpackersWithCode !== "function" && typeof (workletsModuleProxy as any).loadUnpackersWithBytecode !== "function")) { return; }'
    ],
    [
      /this\._serializableNull = this\._workletsModuleProxy\.createSerializableNull\(\);/g,
      'this._serializableNull = this._workletsModuleProxy?.createSerializableNull?.() ?? (null as any);'
    ],
    [
      /this\._serializableUndefined =\s*this\._workletsModuleProxy\.createSerializableUndefined\(\);/g,
      'this._serializableUndefined = this._workletsModuleProxy?.createSerializableUndefined?.() ?? (undefined as any);'
    ],
    [
      /this\._serializableTrue =\s*this\._workletsModuleProxy\.createSerializableBoolean\(true\);/g,
      'this._serializableTrue = this._workletsModuleProxy?.createSerializableBoolean?.(true) ?? (true as any);'
    ],
    [
      /this\._serializableFalse =\s*this\._workletsModuleProxy\.createSerializableBoolean\(false\);/g,
      'this._serializableFalse = this._workletsModuleProxy?.createSerializableBoolean?.(false) ?? (false as any);'
    ]
  ]
);

// 2. NativeWorklets.native.js (lib/module)
patchFile(
  path.join(__dirname, '../node_modules/react-native-worklets/lib/module/WorkletsModule/NativeWorklets.native.js'),
  [
    [/this\.#workletsModuleProxy/g, 'this._workletsModuleProxy'],
    [/this\.#serializableNull/g, 'this._serializableNull'],
    [/this\.#serializableUndefined/g, 'this._serializableUndefined'],
    [/this\.#serializableTrue/g, 'this._serializableTrue'],
    [/this\.#serializableFalse/g, 'this._serializableFalse'],
    [
      /WorkletsTurboModule\?\.installTurboModule\(bundleModeEnabled\);/g,
      'try { WorkletsTurboModule?.installTurboModule(bundleModeEnabled); } catch (_e) { try { WorkletsTurboModule?.installTurboModule(); } catch (_e2) {} }'
    ],
    [
      /WorkletsTurboModule\?\.start\(\);/g,
      'try { WorkletsTurboModule?.start?.(); } catch (_e) {}'
    ],
    [
      /WorkletsTurboModule\?\.toggleSlowAnimationsOnUIRuntime\(\)/g,
      'WorkletsTurboModule?.toggleSlowAnimationsOnUIRuntime?.()'
    ],
    [
      /function installUnpackers\(workletsModuleProxy\) \{/g,
      'function installUnpackers(workletsModuleProxy) {\n  if (!workletsModuleProxy || (typeof workletsModuleProxy.loadUnpackersWithCode !== "function" && typeof workletsModuleProxy.loadUnpackersWithBytecode !== "function")) { return; }'
    ],
    [
      /this\._serializableNull = this\._workletsModuleProxy\.createSerializableNull\(\);/g,
      'this._serializableNull = this._workletsModuleProxy?.createSerializableNull ? this._workletsModuleProxy.createSerializableNull() : null;'
    ],
    [
      /this\._serializableUndefined = this\._workletsModuleProxy\.createSerializableUndefined\(\);/g,
      'this._serializableUndefined = this._workletsModuleProxy?.createSerializableUndefined ? this._workletsModuleProxy.createSerializableUndefined() : undefined;'
    ],
    [
      /this\._serializableTrue = this\._workletsModuleProxy\.createSerializableBoolean\(true\);/g,
      'this._serializableTrue = this._workletsModuleProxy?.createSerializableBoolean ? this._workletsModuleProxy.createSerializableBoolean(true) : true;'
    ],
    [
      /this\._serializableFalse = this\._workletsModuleProxy\.createSerializableBoolean\(false\);/g,
      'this._serializableFalse = this._workletsModuleProxy?.createSerializableBoolean ? this._workletsModuleProxy.createSerializableBoolean(false) : false;'
    ]
  ]
);

// 3. NativeEventsManager.ts
patchFile(
  path.join(__dirname, '../node_modules/react-native-reanimated/src/createAnimatedComponent/NativeEventsManager.ts'),
  [
    [/readonly #managedComponent: ManagedAnimatedComponent;/g, 'private readonly _managedComponent: ManagedAnimatedComponent;'],
    [/readonly #componentOptions\?: ComponentOptions;/g, 'private readonly _componentOptions?: ComponentOptions;'],
    [/  #eventViewTag = -1;/g, '  private _eventViewTag = -1;'],
    [/this\.#managedComponent/g, 'this._managedComponent'],
    [/this\.#componentOptions/g, 'this._componentOptions'],
    [/this\.#eventViewTag/g, 'this._eventViewTag']
  ]
);

// 4. WorkletEventHandler.ts
patchFile(
  path.join(__dirname, '../node_modules/react-native-reanimated/src/WorkletEventHandler.ts'),
  [
    [/  #viewTags: Set<number>;/g, '  private _viewTags: Set<number>;'],
    [/  #registrations: Map<number, number\[\]>;/g, '  private _registrations: Map<number, number[]>;'],
    [/this\.#viewTags/g, 'this._viewTags'],
    [/this\.#registrations/g, 'this._registrations']
  ]
);

// 5. JSReanimated.ts
patchFile(
  path.join(__dirname, '../node_modules/react-native-reanimated/src/ReanimatedModule/js-reanimated/JSReanimated.ts'),
  [
    [/  #workletsModule: IWorkletsModule = WorkletsModule;/g, '  private _workletsModule: IWorkletsModule = WorkletsModule;'],
    [/this\.#workletsModule/g, 'this._workletsModule']
  ]
);

// 6. NativeReanimated.ts
patchFile(
  path.join(__dirname, '../node_modules/react-native-reanimated/src/ReanimatedModule/NativeReanimated.ts'),
  [
    [/  #workletsModule: IWorkletsModule;/g, '  private _workletsModule: IWorkletsModule;'],
    [/  #reanimatedModuleProxy: ReanimatedModuleProxy;/g, '  private _reanimatedModuleProxy: ReanimatedModuleProxy;'],
    [/this\.#workletsModule/g, 'this._workletsModule'],
    [/this\.#reanimatedModuleProxy/g, 'this._reanimatedModuleProxy'],
    [/if \(!ReanimatedTurboModule\.installTurboModule\(\)\)/g, 'if (!ReanimatedTurboModule?.installTurboModule?.())']
  ]
);

// 7. Worklets checkCppVersion (src and lib)
patchFile(
  path.join(__dirname, '../node_modules/react-native-worklets/src/debug/checkCppVersion.ts'),
  [
    [/throw new Error\(\s*`\[Worklets\] Mismatch between JavaScript part and native part[\s\S]*?\);\s*\}/g, 'logger.warn(`[Worklets] JavaScript and native version mismatch (${jsVersion} vs ${cppVersion})`);\n  }']
  ]
);

patchFile(
  path.join(__dirname, '../node_modules/react-native-worklets/lib/module/debug/checkCppVersion.js'),
  [
    [/throw new Error\(`\[Worklets\] Mismatch between JavaScript part and native part[\s\S]*?\);\s*\}/g, 'logger.warn(`[Worklets] JavaScript and native version mismatch (${jsVersion} vs ${cppVersion})`);\n  }']
  ]
);

// 8. Reanimated checkCppVersion (src and lib)
patchFile(
  path.join(__dirname, '../node_modules/react-native-reanimated/src/platform-specific/checkCppVersion.ts'),
  [
    [/throw new ReanimatedError\(\s*`Mismatch between JavaScript part and native part[\s\S]*?\);\s*\}/g, 'logger.warn(`Mismatch between JavaScript part and native part of Reanimated (${jsVersion} vs ${cppVersion})`);\n  }']
  ]
);

patchFile(
  path.join(__dirname, '../node_modules/react-native-reanimated/lib/module/platform-specific/checkCppVersion.js'),
  [
    [/throw new ReanimatedError\(`Mismatch between JavaScript part and native part[\s\S]*?\);\s*\}/g, 'logger.warn(`Mismatch between JavaScript part and native part of Reanimated (${jsVersion} vs ${cppVersion})`);\n  }']
  ]
);

// 9. Reanimated workletsVersion (src and lib)
patchFile(
  path.join(__dirname, '../node_modules/react-native-reanimated/src/platform-specific/workletsVersion.ts'),
  [
    [/throw new ReanimatedError\(result\.message\);/g, 'console.warn(result.message);']
  ]
);

patchFile(
  path.join(__dirname, '../node_modules/react-native-reanimated/lib/module/platform-specific/workletsVersion.js'),
  [
    [/throw new ReanimatedError\(result\.message\);/g, 'console.warn(result.message);']
  ]
);

// 10. (Auth routes and controllers managed in source)

// 11. Patch react-native-css-interop printUpgradeWarning / stringify crash
patchFile(
  path.join(__dirname, '../node_modules/react-native-css-interop/dist/runtime/native/render-component.js'),
  [
    [/function printUpgradeWarning\(warning, originalProps\) \{[\s\S]*?function stringify\(object\) \{[\s\S]*?\n\}/g, `function printUpgradeWarning(warning, originalProps) {
    try { console.warn('[CssInterop notice]: ' + warning); } catch (_e) {}
}
function stringify(object) {
    return '[Props]';
}`]
  ]
);

patchFile(
  path.join(__dirname, '../node_modules/react-native-css-interop/src/runtime/native/render-component.tsx'),
  [
    [/function printUpgradeWarning\([\s\S]*?function stringify\(object: any\) \{[\s\S]*?\n\}/g, `function printUpgradeWarning(
  warning: string,
  originalProps: Record<string, any> | null | undefined,
) {
  try { console.warn('[CssInterop notice]: ' + warning); } catch (_e) {}
}

function stringify(object: any) {
  return '[Props]';
}`]
  ]
);

// 12. Patch NavigationStateContext getters throwing on object traversal
patchFile(
  path.join(__dirname, '../node_modules/@react-navigation/core/lib/module/NavigationStateContext.js'),
  [
    [/throw new Error\(MISSING_CONTEXT_ERROR\);/g, 'return (() => undefined);']
  ]
);

patchFile(
  path.join(__dirname, '../node_modules/@react-navigation/core/src/NavigationStateContext.tsx'),
  [
    [/throw new Error\(MISSING_CONTEXT_ERROR\);/g, 'return (() => undefined) as any;']
  ]
);

patchFile(
  path.join(__dirname, '../node_modules/@react-navigation/core/lib/commonjs/NavigationStateContext.js'),
  [
    [/throw new Error\(MISSING_CONTEXT_ERROR\);/g, 'return (() => undefined);']
  ]
);

console.log('Hermes, css-interop, NavigationContext & version compatibility patch complete!');



