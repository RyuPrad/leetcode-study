<iframe
  src="time_needed_to_inform_all_employees_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| n | number of employees |
| headID | the head of the company |
| manager | manager[i] is the direct manager of employee i (-1 for the head) |
| informTime | minutes employee i needs to tell all direct reports |
| reports | direct reports of each employee |
| i | employee being added to their manager's list |
| queue | [employee, minute they hear the news] in breadth-first order |
| res | latest minute anyone hears the news |
| head | next queue entry |
| id | employee being expanded |
| time | minute id hears the news |
| next | direct report of id |
