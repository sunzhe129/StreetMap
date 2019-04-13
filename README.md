# How the app was built

* This app was built with the create-react-app, cleaned up the unused files. For the offline support, reply on the built-in Service Worker provided by the create-react-app, but it's only available in production mode. Did some investigation on how to customize Service worker and let it work in the development mode, but looks it needs to some customization for create-react-app, which needs more efforts.

# How to run the application

* Install all project dependencies at the project root folder with `npm install`.
* Run the app in the development mode with `npm start`, which normally open [http://localhost:3000] to view it in the browser automatically.

# How to use the application

* At the page loading, we will query Google map once to display the map of the district I am living at the right hand side of the page, also will display 6 interested locations with markers on the map, and at the left hand side of the page, will display the list of these 6 interested locations.
* The user can click on the markers on the map, then the clicked marker will start to bounce to indicate it's selected, also an info window will pop up to show the additional address info of the selected location(NOTE: The additional address info is from FOURSQUARE).
* The user can input a filter string in the text input field at the top left of the page, to filter the locations he/she is interested, the location list right below the text input field will update immediately to only display the matched locations, also the markers on the map will update to only display the ones matching the filtered locations.
* There's a hamburger button at the top of the map, it can be used to toggle the display of the location list at the left hand side of the page.
* If the page width is greater than 600px, then the location list will be displayed by default, otherwise it will be hidden.