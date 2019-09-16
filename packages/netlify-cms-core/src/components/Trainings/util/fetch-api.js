const apiUrl = `/events/api`;

export const getData = (resource, options = null) => {
  let query = `${apiUrl}/${resource}`;
  if (options) {
    let params = new URLSearchParams();
    for (let key in options) {
      params.append(key, options[key]);
    }
    if (params.toString() !== '') {
      query += `?${params.toString()}`;
    }
  }
  return fetch(query, { credentials: 'same-origin' })
    .then(res => {
      if (res.ok) {
        return res.json();
      } else {
        return {
          error: `Failed to load ${resource}`
        };
      }
    })
    .catch(error => {
      return {
        error
      };
    });
}

export const postData = (resource, data) => {
  return fetch(`${apiUrl}/${resource}`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(data)
  })
    .then(res => {
      if (res.status === 404) {
        throw new Error('Cannot post to that resource');
      }
      return res.status;
    })
    .catch(error => {
      return {
        error
      };
    });
}