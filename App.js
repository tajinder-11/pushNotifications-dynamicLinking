import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";

import { SCREEN_NAMES } from "./src/utils/constants/navigationConstants";
import Chats from "./src/screens/Chats.js";
import Messages from "./src/screens/Messages";

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name={SCREEN_NAMES.Chats} component={Chats} />
        <Stack.Screen name={SCREEN_NAMES.Messages} component={Messages} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
