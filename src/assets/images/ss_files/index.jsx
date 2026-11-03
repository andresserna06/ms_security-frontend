import.meta.env = {"BASE_URL": "/", "DEV": true, "MODE": "development", "PROD": false, "SSR": false, "VITE_AZURE_CLIENT_ID": "bf7d03c0-d403-4c17-9656-ecc130288f96", "VITE_GOOGLE_CLIENT_ID": "438156959587-38rsk2u6qf7qgpgsl4bi13nat3uc5mh2.apps.googleusercontent.com", "VITE_URL_BACKEND": "http://localhost:8181"};const React = !__vite__cjsImport0_react.__esModule ? __vite__cjsImport0_react : __vite__cjsImport0_react.default;const createRoot = __vite__cjsImport1_reactDom_client["createRoot"];const _jsxDEV = __vite__cjsImport10_react_jsxDevRuntime["jsxDEV"];import __vite__cjsImport0_react from "/node_modules/.vite/deps/react.js?v=ac4a2446";
import __vite__cjsImport1_reactDom_client from "/node_modules/.vite/deps/react-dom_client.js?v=ac4a2446";
import { Provider } from "/node_modules/.vite/deps/react-redux.js?v=ac4a2446";
import { GoogleOAuthProvider } from "/node_modules/.vite/deps/@react-oauth_google.js?v=ac4a2446";
import "/node_modules/.vite/deps/core-js.js?v=ac4a2446";
import App from "/src/App.jsx";
import store from "/src/store.js";
import "/node_modules/bootstrap/dist/css/bootstrap.min.css";
import "/src/scss/style.scss";
import { serviceContainer } from "/src/services/serviceContainer.ts";
var _jsxFileName = "C:/Universidad/Sexto Semestre/Backend/deportes/ms_security-frontend/src/index.jsx";
import __vite__cjsImport10_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=ac4a2446";
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const isMsalPopup = typeof window !== "undefined" && window.opener && window.opener !== window && (window.name.includes("msal") || window.location.hash.includes("code=") || window.location.hash.includes("state=") || window.location.hash.includes("error="));
if (!isMsalPopup) {
	createRoot(document.getElementById("root")).render(/* @__PURE__ */ _jsxDEV(GoogleOAuthProvider, {
		clientId: googleClientId,
		children: /* @__PURE__ */ _jsxDEV(Provider, {
			store,
			children: /* @__PURE__ */ _jsxDEV(App, {
				authService: serviceContainer.authService,
				googleOAuthProvider: serviceContainer.googleOAuthProvider,
				azureOAuthProvider: serviceContainer.azureOAuthProvider,
				roleService: serviceContainer.roleService,
				permissionService: serviceContainer.permissionService,
				userService: serviceContainer.userService,
				profileService: serviceContainer.profileService
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 30,
				columnNumber: 9
			}, this)
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 29,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 28,
		columnNumber: 5
	}, this));
}

//# sourceMappingURL=data:application/json;base64,eyJtYXBwaW5ncyI6IkFBQUEsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsa0JBQWtCO0FBQzNCLFNBQVMsZ0JBQWdCO0FBQ3pCLFNBQVMsMkJBQTJCO0FBQ3BDLE9BQU87QUFFUCxPQUFPLFNBQVM7QUFDaEIsT0FBTyxXQUFXO0FBRWxCLE9BQU87QUFDUCxPQUFPO0FBRVAsU0FBUyx3QkFBd0I7OztBQUVqQyxNQUFNLGlCQUFpQixZQUFZLElBQUkseUJBQXlCO0FBRWhFLE1BQU0sY0FDSixPQUFPLFdBQVcsZUFDbEIsT0FBTyxVQUNQLE9BQU8sV0FBVyxXQUNqQixPQUFPLEtBQUssU0FBUyxNQUFNLEtBQzFCLE9BQU8sU0FBUyxLQUFLLFNBQVMsT0FBTyxLQUNyQyxPQUFPLFNBQVMsS0FBSyxTQUFTLFFBQVEsS0FDdEMsT0FBTyxTQUFTLEtBQUssU0FBUyxRQUFRO0FBRTFDLElBQUksQ0FBQyxhQUFhO0NBQ2hCLFdBQVcsU0FBUyxlQUFlLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FDMUMsd0JBQUMscUJBQUQ7RUFBcUIsVUFBVTtZQUM3Qix3QkFBQyxVQUFEO0dBQWlCO2FBQ2Ysd0JBQUMsS0FBRDtJQUNFLGFBQWEsaUJBQWlCO0lBQzlCLHFCQUFxQixpQkFBaUI7SUFDdEMsb0JBQW9CLGlCQUFpQjtJQUNyQyxhQUFhLGlCQUFpQjtJQUM5QixtQkFBbUIsaUJBQWlCO0lBQ3BDLGFBQWEsaUJBQWlCO0lBQzlCLGdCQUFnQixpQkFBaUI7R0FDbEM7Ozs7O0VBQ087Ozs7O0NBQ1M7Ozs7U0FDdkI7QUFDRiIsIm5hbWVzIjpbXSwic291cmNlcyI6WyJpbmRleC5qc3giXSwidmVyc2lvbiI6Mywic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgY3JlYXRlUm9vdCB9IGZyb20gJ3JlYWN0LWRvbS9jbGllbnQnXG5pbXBvcnQgeyBQcm92aWRlciB9IGZyb20gJ3JlYWN0LXJlZHV4J1xuaW1wb3J0IHsgR29vZ2xlT0F1dGhQcm92aWRlciB9IGZyb20gJ0ByZWFjdC1vYXV0aC9nb29nbGUnXG5pbXBvcnQgJ2NvcmUtanMnXG5cbmltcG9ydCBBcHAgZnJvbSAnLi9BcHAnXG5pbXBvcnQgc3RvcmUgZnJvbSAnLi9zdG9yZSdcblxuaW1wb3J0ICdib290c3RyYXAvZGlzdC9jc3MvYm9vdHN0cmFwLm1pbi5jc3MnXG5pbXBvcnQgJy4vc2Nzcy9zdHlsZS5zY3NzJ1xuXG5pbXBvcnQgeyBzZXJ2aWNlQ29udGFpbmVyIH0gZnJvbSAnLi9zZXJ2aWNlcy9zZXJ2aWNlQ29udGFpbmVyJ1xuXG5jb25zdCBnb29nbGVDbGllbnRJZCA9IGltcG9ydC5tZXRhLmVudi5WSVRFX0dPT0dMRV9DTElFTlRfSUQgfHwgJydcblxuY29uc3QgaXNNc2FsUG9wdXAgPVxuICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJlxuICB3aW5kb3cub3BlbmVyICYmXG4gIHdpbmRvdy5vcGVuZXIgIT09IHdpbmRvdyAmJlxuICAod2luZG93Lm5hbWUuaW5jbHVkZXMoJ21zYWwnKSB8fFxuICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoLmluY2x1ZGVzKCdjb2RlPScpIHx8XG4gICAgd2luZG93LmxvY2F0aW9uLmhhc2guaW5jbHVkZXMoJ3N0YXRlPScpIHx8XG4gICAgd2luZG93LmxvY2F0aW9uLmhhc2guaW5jbHVkZXMoJ2Vycm9yPScpKVxuXG5pZiAoIWlzTXNhbFBvcHVwKSB7XG4gIGNyZWF0ZVJvb3QoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jvb3QnKSkucmVuZGVyKFxuICAgIDxHb29nbGVPQXV0aFByb3ZpZGVyIGNsaWVudElkPXtnb29nbGVDbGllbnRJZH0+XG4gICAgICA8UHJvdmlkZXIgc3RvcmU9e3N0b3JlfT5cbiAgICAgICAgPEFwcFxuICAgICAgICAgIGF1dGhTZXJ2aWNlPXtzZXJ2aWNlQ29udGFpbmVyLmF1dGhTZXJ2aWNlfVxuICAgICAgICAgIGdvb2dsZU9BdXRoUHJvdmlkZXI9e3NlcnZpY2VDb250YWluZXIuZ29vZ2xlT0F1dGhQcm92aWRlcn1cbiAgICAgICAgICBhenVyZU9BdXRoUHJvdmlkZXI9e3NlcnZpY2VDb250YWluZXIuYXp1cmVPQXV0aFByb3ZpZGVyfVxuICAgICAgICAgIHJvbGVTZXJ2aWNlPXtzZXJ2aWNlQ29udGFpbmVyLnJvbGVTZXJ2aWNlfVxuICAgICAgICAgIHBlcm1pc3Npb25TZXJ2aWNlPXtzZXJ2aWNlQ29udGFpbmVyLnBlcm1pc3Npb25TZXJ2aWNlfVxuICAgICAgICAgIHVzZXJTZXJ2aWNlPXtzZXJ2aWNlQ29udGFpbmVyLnVzZXJTZXJ2aWNlfVxuICAgICAgICAgIHByb2ZpbGVTZXJ2aWNlPXtzZXJ2aWNlQ29udGFpbmVyLnByb2ZpbGVTZXJ2aWNlfVxuICAgICAgICAvPlxuICAgICAgPC9Qcm92aWRlcj5cbiAgICA8L0dvb2dsZU9BdXRoUHJvdmlkZXI+LFxuICApXG59XG4iXX0=