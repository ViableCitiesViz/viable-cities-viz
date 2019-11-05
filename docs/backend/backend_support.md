## Backend support

The visualization demo currently uses project data from local JSON files. This works well for a demo but is not sufficent for a real system.

There are several issues to deal with in the future.

- The number of projects will be much bigger and growing
- Project data must be collected in a feasible way
- Project data must be stored in a secure way
- Project data must be maintained over time
- Searching and analysing project data must be supported

### Data storage

This is realized with a backend using a Postgres database and custom API:s for application access. Some parts of this are fully functional and can be tested, see [survey_api](https://github.com/kamidev/survey_api).

#### Replacing mock-data json files with real data, using API

Note that this endpoint is password-protected, you must contact ViableCities if you need access.

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

### Conceptual data model

Basic project data is connected to information about partners and locations. Projects can also be classified by focus areas and themes, see the expanded version below for more details.

Here is a conceptual overview of data used by Viablecities Viz ([compact](conceptual_compact.pdf) and [expanded](conceptual_expanded.pdf)).

An existing online tool for project followup, ViableCities FeedBack, has been extended to also collect basic project data. See `Online Surveys`and `Feedback and Followup` in the conceptual model. This is currently just a proof-of-concept.
