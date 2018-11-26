import { matchPath } from 'react-router';

// NOTE: For all methods that take props as an argument, it assumed that props in an object which contains
// the history property and the filteredData property. If the history property is missing, make sure to 
// use the 'withRouter' Higher-Order-Component on whatever component ProjectNavigator is used from.
class ProjectNavigator {
  constructor(rootPath = '') {
    this.rootPath = rootPath;
    this._hasChangedSinceInit = false;
  }

  hasChangedSinceInit() {
    return this._hasChangedSinceInit;
  }

  triggerChange() {
    this._hasChangedSinceInit = true;
  }

  redirectToRoot(history) {
    history.replace(this.rootPath);
  }

  goToRoot(history, location) {
    if (matchPath(location.pathname, { path: this.rootPath, exact: true }) === null) {
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

  getProjectId(location) {
    const match = matchPath(location.pathname, { path: `${this.rootPath}/project/:id` });
    if (match !== null)
      return match.params.id;
    return -1;
  }

  projectIsActive(location, filteredData) {
    const id = this.getProjectId(location);
    if (filteredData.data.find(d => d.survey_answers.project_id === id))
      return true;
    return false;
  }

  projectHasChanged(location, prevLocation) {
    return this.getProjectId(location) !== this.getProjectId(prevLocation);
  }
}

export default ProjectNavigator;
