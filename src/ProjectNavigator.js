import { matchPath } from "react-router";

// NOTE: For all methods that take props as an argument, it assumed that props is an object which contains
// the history property and the filteredData property. If the history property is missing, make sure to
// use the 'withRouter' higher-order-component on whatever component ProjectNavigator is used from.
class ProjectNavigator {
  constructor(rootPath = "") {
    this.rootPath = rootPath;
    this._hasChangedSinceInit = false;
  }

  static GetProjectId(location) {
    const match = matchPath(location.pathname, { path: `*/project/:id` });
    if (match !== null) return match.params.id;
    return -1;
  }

  hasChangedSinceInit() {
    return this._hasChangedSinceInit;
  }

  change() {
    this._hasChangedSinceInit = true;
  }

  redirectToRoot(history) {
    history.replace(this.rootPath);
  }

  goToRoot(history, location) {
    if (
      matchPath(location.pathname, { path: this.rootPath, exact: true }) ===
      null
    ) {
      this._hasChangedSinceInit = true;
      history.push(this.rootPath);
    }
  }

  goToProject(history, location, id) {
    const path = `${this.rootPath}/project/${id}`;
    if (matchPath(location.pathname, { path }) === null) {
      this._hasChangedSinceInit = true;
      history.push(path);
    }
  }

  projectExists(location, filteredData) {
    const id = ProjectNavigator.GetProjectId(location);
    if (filteredData.data.find(d => d.survey_answers.project_id === id))
      return true;
    return false;
  }

  projectHasChanged(location, prevLocation) {
    return (
      ProjectNavigator.GetProjectId(location) !==
      ProjectNavigator.GetProjectId(prevLocation)
    );
  }
}

export const GetProjectId = ProjectNavigator.GetProjectId;
export default ProjectNavigator;
