import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { components, buttons, shadows } from 'netlify-cms-ui-default';

import { getData, postData } from './util/fetch-api';
import { formStatus as status } from './util/enum';

const initialState = {
  title: '',
  duration: 1,
  externalLink: '',
  categoryId: '',
  formStatus: status.UNTOUCHED,
  errors: [],
  categories: [
    {
      "id": 1,
      "name": "Autonomous Decision-Making"
    }, {
      "id": 2,
      "name": "Direct Management"
    }, {
      "id": 3,
      "name": "Indirect Management"
    }
  ]
}

const AddTrainingForm = () => {
  const [title, setTitle] = useState(initialState.title);
  const [duration, setDuration] = useState(initialState.duration);
  const [externalLink, setExternalLink] = useState(initialState.externalLink);
  // const [languageId, setLanguageId] = useState(null);
  const [categoryId, setCategoryId] = useState(initialState.categoryId);
  const [formStatus, setFormStatus] = useState(initialState.formStatus);
  const [errors, setErrors] = useState(initialState.errors);

  // const [languages, setLanguages] = useState([]);
  const [categories, setCategories] = useState(initialState.categories);
  const [trainings, setTrainings] = useState([]);

  // On initial load
  useEffect(() => {
    // getData('trainings/languages')
    //   .then(res => {
    //     setLanguages(res);
    //   });
    getData('trainings/categories')
      .then(res => {
        if (res.error) {
          console.error(res.error);
          return;
        }
        setCategories(res);
      })
  }, []);

  // On form status change
  useEffect(() => {
    if (formStatus === status.SUBMITTED) {
      getData('trainings')
        .then(res => {
          setTrainings(res);
        });
      setTitle(initialState.title);
      setDuration(initialState.duration);
      setExternalLink(initialState.externalLink);
      setCategoryId(initialState.categoryId);
      setErrors(initialState.errors);
      setFormStatus(initialState.formStatus);
    }
  }, [formStatus]);

  // On form input change
  useEffect(() => {
    if (formStatus === status.UNTOUCHED || formStatus === status.ERROR) {
      setFormStatus(status.IN_PROGRESS);
    }
  }, [title, duration, externalLink, categoryId]);

  function handleSubmit(e) {
    e.preventDefault();
    let errors = checkForErrors();
    if (errors.length > 0) {
      setErrors(errors);
      return;
    }
    postData('trainings', {
        title,
        duration,
        externalLink,
        categoryId
      })
        .then(res => {
          if (res.error) {
            setErrors([err]);
            setFormStatus(status.ERROR);
            return;
          }
          setFormStatus(status.SUBMITTED);
        });
  }

  function checkForErrors() {
    let errors = [];
    if (!title) {
      errors.push('Must provide a title for the training');
    }
    if (!duration) {
      errors.push('Must provide a duration in minutes');
    }
    if (!externalLink) {
      errors.push('Must provide a valid link to the external training');
    }
    if (categories.length > 0 && !categoryId) {
      errors.push('Must select a category for the training');
    }
    return errors;
  }

  return (
    <section id="trainings-collection">
      <Card style={{ margin: '2em auto' }}>
        <form onSubmit={handleSubmit}>
          <h2 style={{ fontSize: '2em', fontWeight: 700 }}>Add a training</h2>
          <FormGroup>
            <FormLabel htmlFor="title">Title</FormLabel>
            <input name="title"
              type="text"
              value={title}
              onChange={e => setTitle(e.currentTarget.value)}
              style={inputStyles}
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>Duration (minutes)</FormLabel>
            <input name="duration"
              type="number"
              min="1"
              value={duration}
              onChange={e => setDuration(parseInt(e.currentTarget.value, 10))}
              style={inputStyles}
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>External Link</FormLabel>
            <input name="external-link"
              type="text"
              value={externalLink}
              onChange={e => setExternalLink(e.currentTarget.value)}
              style={inputStyles}
            />
          </FormGroup>
          {categories.length > 0 &&
            <FormGroup>
              <FormLabel>Category</FormLabel>
              <select name="category"
                value={categoryId}
                onChange={e => setCategoryId(parseInt(e.target.value, 10))}
                style={inputStyles}
              >
                <option value=""></option>
                {categories.map(cat => (
                  <option key={cat.id + '-' + cat.name} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </FormGroup>
          }
          <SubmitButton type="submit" />
          {/* languages.length > 0 &&
            <Fragment>
              <label>Language</label>
              <select name="language"
                value={languageId}
                onChange={e => setLanguageId(parseInt(e.target.value, 10))}
              >
                <option value=""></option>
                {languages.length > 0 && languages.map(lang => (
                  <option value={lang.id}>{lang.name}</option>
                ))}
              </select>
            </Fragment>
          */}
          {errors.length > 0 &&
          <div className="form__errors">
            <strong>Errors</strong>
            <List>
              {errors.map((err, i) => <li key={i + '-' + err}>{err}</li>)}
            </List>
          </div>
        }
        </form>
      </Card>
      <Card id="existing-trainings" style={{ margin: '0 auto' }}>
        <h2 style={{ fontSize: '2em', fontWeight: 700 }}>Trainings</h2>
        {trainings.length > 0 ?
          <List>
            {trainings.map((t, i) => <li key={i + '-' + t.title}>{t.title} - <a href={t.external_link} target="_blank">External Link</a> [{t.category}]</li>)}
          </List>
          :
          <p>No trainings detected.</p>
        }
      </Card>
    </section>
  )
};

const Card = styled.div`
  ${components.cardTop};
`;

const FormGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 1em 0;
`;

const FormLabel = styled.label`
  min-width: 170px;
`;

const inputStyles = {
  height: '2em',
  flex: '2 1 auto',
  border: '1px solid #CCC'
}

const SubmitButton = styled.input`
  ${buttons.button};
  ${shadows.dropDeep};
  ${buttons.default};
  ${buttons.gray};

  padding: 0 30px;
  margin-left: auto;
  display: block;
`;

const List = styled.ul`
  padding-left: 2em;
`;

export default AddTrainingForm;