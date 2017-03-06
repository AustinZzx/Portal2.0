import React from 'react';
import ReactDOM from 'react-dom';
import Autosuggest from 'react-autosuggest';

var workflowSuggestions = [];

// https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions#Using_Special_Characters
function escapeRegexCharacters(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getSuggestions(value) {
  const escapedValue = escapeRegexCharacters(value.trim());
  
  if (escapedValue === '') {
    return [];
  }

  const regex = new RegExp(escapedValue, 'i');

  return workflowSuggestions.filter(workflowLabel => regex.test(workflowLabel.label));
}

function getSuggestionValue(suggestion) {
  localStorage.setItem("workflow-uri", suggestion.uri);
  return suggestion.label;
}

function renderSuggestion(suggestion) {
  return (
    <span>{suggestion.label}</span>
  );
}

/**
* Method for parsing the names and URIs of the templates			 
*/
function parseAutocompleteData(res) {
  if(res.results && res.results.bindings) {
    var bindings = res.results.bindings;
    for(var i =0; i < bindings.length; i++) {
      var binding = bindings[i];
      if(binding.label && binding.wf) {
        if(binding.wf.value.toLowerCase().indexOf("list_of") == -1) {
          var label = binding.label.value;
          label = label.replace(/\-d.*/g,"");
          if(label.toLowerCase().indexOf(".jpg") == -1 && 
             label.toLowerCase().indexOf(".png") == -1 &&
             label.toLowerCase().indexOf(".gif") == -1) {
               var newElement = {label:label, uri:binding.wf.value};
               workflowSuggestions.push(newElement);
          }
        }
      }
    }
  }
}

class SearchBar extends React.Component {
  constructor() {
    super();

    this.state = {
      value: '',
      suggestions: []
    };    
    this.onChange = this.onChange.bind(this);
    this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this);
    this.onSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(this);
    this.onSuggestionSelected = this.onSuggestionSelected.bind(this);
  }
    
  componentDidMount() {
      // call function to execute ajax call from query.js, passing into it, a function that takes in an input "res" which we define to execute when the ajax call returns successfully
      populateSearchBar(function(res) { 
          //executes after ajax call returns
          parseAutocompleteData(res);
      });
      
      var goButton = document.getElementById("id-button");
      goButton.addEventListener('click', function() {
          window.location = "../html/workflow-main.html";
      });
  }

  onChange(event, { newValue, method }) {
    this.setState({
      value: newValue
    });
  };
  
  onSuggestionsFetchRequested({ value }) {
    this.setState({
      suggestions: getSuggestions(value)
    });
  };

  onSuggestionsClearRequested() {
    this.setState({
      suggestions: []
    });
  };
    
  onSuggestionSelected(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) {
      window.location = "../html/workflow-main.html";
  };

  render() {
    const { value, suggestions } = this.state;
    const inputProps = {
      placeholder: "Search for Workflows",
      value,
      onChange: this.onChange
    };
    return (
      <Autosuggest 
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps} />
    );
  }
}

ReactDOM.render(<SearchBar />, document.getElementById('search-bar'));
