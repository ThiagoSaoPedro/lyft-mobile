global.__DEV__ = true;
global.__ExpoImportMetaRegistry = { get: () => { } };

jest.mock('@expo/vector-icons', () => {
    return {
        MaterialCommunityIcons: 'MaterialCommunityIcons',
    };
});

jest.mock('react-native/Libraries/Utilities/warnOnce', () => jest.fn());
