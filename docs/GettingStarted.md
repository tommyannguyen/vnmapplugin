# Getting Started

Congratulations, you successfully installed @vnmapplugin/maps! 🎉
Where to go from here?
You can head straight to the [examples](/example) folder if you want to jump into the deep end.
However, if you prefer an easier ramp-up, then make sure to stick around and check out the guides below.

## Installation

```sh
npm install @vnmapplugin/maps
# or
yarn add @vnmapplugin/maps
```

## Setting your access token

In order to work, VnMapPlugin requires you to create an access token and set it in your app.
Once you have your access token, set it like this:

```js
import VnMapPlugin from "@vnmapplugin/maps";

VnMapPlugin.setAccessToken("<YOUR_ACCESSTOKEN>");
```

## Setting connection status [Android only]

If you are hosting styles and sources on localhost, you might need to set the connection status manually for VnMapPlugin to be able to use them.

Manually sets the connectivity state of the app, bypassing any checks to the ConnectivityManager. Set to `true` for connected, `false` for disconnected, and `null` for ConnectivityManager to determine.

```js
import VnMapPlugin from "@vnmapplugin/maps";

VnMapPlugin.setConnected(true);
```

## Disabling telemetry

By default VnMapPlugin collects telemetry.
If you would like to programmatically disable this within your app add the code below.

```js
  VnMapPlugin.setTelemetryEnabled(false);
```

## Show a map

```js
import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import VnMapPlugin, {MapView} from "@vnmapplugin/maps";

VnMapPlugin.setAccessToken("<YOUR_ACCESSTOKEN>");

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  container: {
    height: 300,
    width: 300,
    backgroundColor: "tomato"
  },
  map: {
    flex: 1
  }
});

export default class App extends Component {
  render() {
    return (
      <View style={styles.page}>
        <View style={styles.container}>
          <MapView style={styles.map} />
        </View>
      </View>
    );
  }
}
```
