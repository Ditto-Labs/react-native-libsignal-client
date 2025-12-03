import { type ConfigPlugin, withPodfile } from '@expo/config-plugins';

function buildPreInstallBlock() {
	return `
pre_install do |installer|
  installer.pod_targets.each do |pod|
    if pod.name == 'LibSignalClient' || pod.name.start_with?('LibSignalClient/')
      def pod.build_type
        Pod::BuildType.dynamic_framework
      end
    end
  end
end`.trim();
}

function injectBlock(contents: string) {
	const markerStart =
		'# >>> react-native-libsignal-client dynamic LibSignalClient workaround >>>';
	const markerEnd =
		'# <<< react-native-libsignal-client dynamic LibSignalClient workaround <<<';

	const block = `${markerStart}\n${buildPreInstallBlock()}\n${markerEnd}`;

	if (contents.includes(markerStart)) return contents;
	return `${contents.trimEnd()}\n\n${block}\n`;
}

const withDynamicWorkaround: ConfigPlugin<
	{ ios?: { disableStaticWorkarounds?: boolean } } | undefined
> = (config, props) =>
	withPodfile(config, (cfg) => {
		if (props?.ios?.disableStaticWorkarounds) return cfg;
		cfg.modResults.contents = injectBlock(cfg.modResults.contents);
		return cfg;
	});

export default withDynamicWorkaround;
