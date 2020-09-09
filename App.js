import React, {Component} from 'react';
import {WebView} from 'react-native-webview';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  ToastAndroid,
  Alert,
  BackHandler,
} from 'react-native';
var SendIntentAndroid = require('react-native-send-intent');

class MyWebComponent extends Component {
  constructor(props) {
    super(props);
    this.WEBVIEW_REF = React.createRef();

    this.state = {
      loadFailed: false,
      isLoading: true,
      backButtonEnabled: false,
    };
  }

  _onShouldStartLoadWithRequest = (event) => {
    const {url} = event;
    if (
      url.startsWith('intent://') &&
      url.includes('scheme=http') &&
      Platform.OS === 'android'
    ) {
      Alert.alert(
        'Este link será aberto em um aplicativo externo.',
        'Deseja prosseguir?',
        [
          {
            text: 'Sim',
            onPress: () => {
              SendIntentAndroid.openChromeIntent(url);
              return false;
            },
          },
          {
            text: 'Não',
            onPress: () => {
              return true;
            },
          },
        ],
        {cancelable: false},
      );
    }
    return true;
  };

  componentDidMount() {
    ToastAndroid.show(
      'Visite a página do projeto em github.com/LucasTor',
      ToastAndroid.LONG,
    );
    BackHandler.addEventListener('hardwareBackPress', this.backHandler);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backHandler);
  }

  backHandler = () => {
    if (this.state.backButtonEnabled) {
      this.WEBVIEW_REF.current.goBack();
      return true;
    }
    return false;
  };

  _onNavigationStateChange = (navState) => {
    this.setState({
      backButtonEnabled: navState.canGoBack,
    });
  };

  render() {
    const {loadFailed, isLoading} = this.state;

    return (
      <>
        {!loadFailed && (
          <WebView
            ref={this.WEBVIEW_REF}
            originWhitelist={['*']}
            style={{backgroundColor: '#EEE'}}
            source={{uri: 'https://ava.ucs.br/'}}
            onError={() => this.setState({loadFailed: true, isLoading: false})}
            onLoad={() => this.setState({isLoading: false})}
            onNavigationStateChange={this._onNavigationStateChange.bind(this)}
            onShouldStartLoadWithRequest={this._onShouldStartLoadWithRequest.bind(
              this,
            )}
          />
        )}

        {isLoading && (
          <View style={[styles.actInd, {transform: [{scale: 2}]}]}>
            <ActivityIndicator size="large" color="#FFF" />
          </View>
        )}

        {loadFailed && (
          <View style={styles.failView}>
            <Image
              source={require('./img_src/logo_ucs.png')}
              style={{width: 200, resizeMode: 'contain'}}
            />

            <Text style={styles.text}>
              O carregamento da página falhou, por favor, verifique sua conexão
              com a internet e tente novamente...
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                this.setState({loadFailed: false, isLoading: true})
              }>
              <Text>Recarregar</Text>
            </TouchableOpacity>
          </View>
        )}
      </>
    );
  }
}

const styles = StyleSheet.create({
  failView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#EEE',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    backgroundColor: '#DDDDDD',
    padding: 10,
  },
  text: {
    textAlign: 'center',
    fontSize: 14,
    paddingBottom: 20,
    color: 'black',
  },
  actInd: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});

export default MyWebComponent;
