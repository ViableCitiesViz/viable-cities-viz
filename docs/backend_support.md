## Backend support (under development)

The visualization frontend currently uses project data from local JSON files. The plan is to replace this with data from Viz backend.

The backend uses a Postgres database and can be accessed via API calls. It is currently under development.

### Replacing mock-data json files with real data, using API

Note that the endpoint is protected, contact ViableCities if you need access.

Get the latest project data as a JSON file, via API:

```
https://feedback.viablecities.com/viable_api/answers/8
```

Save the new file in `src/assets/data`.

Then edit the following line in `App.jsx` to use the new file.

```
import mockData from "./assets/data/mock-data-v10.json";
```

Running Viz should now work exactly as before.
