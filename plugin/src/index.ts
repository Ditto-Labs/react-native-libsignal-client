import { type ConfigPlugin, createRunOncePlugin } from '@expo/config-plugins';
import { withBuildProperties } from 'expo-build-properties';
import withCoreLibraryDesugaring from './withCoreLibraryDesugaring';
import withDynamicWorkaround from './withDynamicWorkaround';
import withLibsignalClient, {
	type LibSignalConfig,
} from './withLibSignalClient';

export interface LibsignalPluginProps
	extends LibSignalConfig {
	ios?: LibSignalConfig['ios'] & {
		disableStaticWorkarounds?: boolean;
		frameworkLinkage?: 'static' | 'dynamic';
	};
}

const withReactNativeLibsignalClient: ConfigPlugin<
	LibsignalPluginProps | undefined
> = (config, props) => {
	// LibSignalClient needs dynamic frameworks for correct FFI linking (signal_ffi symbols).
	const linkage = props?.ios?.frameworkLinkage || 'dynamic';

	let newConfig = withBuildProperties(config, {
		ios: { useFrameworks: linkage },
	});

	newConfig = withLibsignalClient(newConfig, props);

	// Applys dynamic workaround required for the libsignal to build
	newConfig = withDynamicWorkaround(newConfig, props);

	newConfig = withCoreLibraryDesugaring(newConfig);
	return newConfig;
};

export default createRunOncePlugin(
	withReactNativeLibsignalClient,
	'react-native-libsignal-client'
);
