import * as React from "preact/compat";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import ClearIcon from "@mui/icons-material/Clear";
// import {
//   tags,
//   tagIncludeFilter,
//   tagExcludeFilter,
//   tagRequirementFilter,
// } from "../signals";
import Switch from "@mui/material/Switch";
import Box from "@mui/material/Box";
import { IconButton, Typography } from "@mui/material";
import { TagChip } from "./TagChip";

function Filter(props) {
  const { onChange, label } = props;
  const tagEntries = Object.entries(tags.value);
  return (
    <TagChooser
      onChange={onChange}
      label={label}
      options={tagEntries}
      defaultValue={[]}
    />
  );
  // return (
  //     <Autocomplete
  //         multiple
  //         id="tags-outlined"
  //         options={tagEntries}
  //         onChange={onChange}
  //         // getOptionLabel={(option) => option.title}
  //         getOptionLabel={(option) => option[1]}
  //         defaultValue={[]}
  //         filterSelectedOptions
  //         renderInput={(params) => (
  //             <TextField
  //                 {...params}
  //                 label={label}
  //             // placeholder="Tags"
  //             />
  //         )}
  //     />
  // );
}

export function ManagedTagChooser(props) {
  const { onChange, label, options, value, disabled, ...rest } = props;
  const renderOption = (props, option, state, ownerState) => {
    const label = option[1];
    if (!label) return null;
    return (
      <li {...props}>
        <TagChip tag={label} sx={{ my: undefined, width: "max-content" }} />
      </li>
    );
  };
  const renderTags = (tagValue, getTagProps) =>
    tagValue.map((option, index) => {
      // console.log("props", getTagProps({ index }))
      const { onDelete, ...rest } = getTagProps({ index });
      return (
        <Stack
          {...getTagProps({ index })}
          direction="row"
          flexWrap="nowrap"
          alignItems="center"
          spacing={0.5}
          // component={Paper}
          // elevation={0}
          // variant="outlined"
          sx={{ p: 0.75, borderRadius: "0.5rem" }}
        >
          <TagChip tag={option[1]} />
          <IconButton aria-label="remove" onClick={onDelete}>
            <ClearIcon sx={{ fontSize: "1rem" }}></ClearIcon>
          </IconButton>
        </Stack>
      );
    });
  return (
    <Autocomplete
      multiple
      {...rest}
      id="tags-outlined"
      options={options}
      value={value}
      onChange={onChange}
      getOptionLabel={(option) => option[1]}
      isOptionEqualToValue={(option, value) =>
        options.length === 0 || option[0] === value[0]
      }
      filterSelectedOptions
      renderInput={(params) => <TextField {...params} label={label} />}
      renderOption={renderOption}
      renderTags={renderTags}
      disabled={disabled}
    />
  );
}

export function TagChooser(props) {
  const { onChange, label, options, value, ...rest } = props;
  return (
    <Autocomplete
      multiple
      {...rest}
      id="tags-outlined"
      options={options}
      //   {...(value && { value })}
      onChange={onChange}
      getOptionLabel={(option) => option[1]}
      isOptionEqualToValue={(option, value) => option[0] === value[0]}
      filterSelectedOptions
      renderInput={(params) => <TextField {...params} label={label} />}
    />
  );
}

export function ForceIncludeTags(props) {
  const onChange = (event, value) => {
    tagIncludeFilter.value = value = value.map((v) => Number(v[0]));
  };
  return <Filter onChange={onChange} label="Require Any Tag" />;
}
export function ForceExcludeTags(props) {
  const onChange = (event, value) => {
    tagExcludeFilter.value = value = value.map((v) => Number(v[0]));
  };
  return <Filter onChange={onChange} label="Exclude Tags" />;
}
export function RequireTags(props) {
  const onChange = (event, value) => {
    tagRequirementFilter.value = value = value.map((v) => Number(v[0]));
  };
  return <Filter onChange={onChange} label="Require All Tags" />;
}

export function IncludeTags() {
  const [all, setAll] = React.useState(true);
  React.useEffect(() => {
    if (all) {
      tagRequirementFilter.value = tagIncludeFilter.value;
      tagIncludeFilter.value = [];
    } else {
      tagIncludeFilter.value = tagRequirementFilter.value;
      tagRequirementFilter.value = [];
    }
  }, [all]);
  const onChange = (event, value) => {
    if (all) {
      tagRequirementFilter.value = value = value.map((v) => Number(v[0]));
    } else {
      tagIncludeFilter.value = value = value.map((v) => Number(v[0]));
    }
  };
  const label = all ? "Require All Tags" : "Require Any Tag";
  return (
    <Stack direction="row" spacing={1} alignItems={"center"}>
      <Box sx={{ flexGrow: 1 }}>
        <Filter onChange={onChange} label={label} />
      </Box>
      {/* <Typography aria-label="All">All?</Typography> */}
      <Switch
        checked={all}
        onChange={(e) => setAll(e.target.checked)}
        aria-label="Toggle between requiring any tag or all tags"
      />
    </Stack>
  );
}

export function Tags() {
  // tags is an object where the keys are the tag ids and the values are the tag names
  // const tagNames = Object.values(tags.value);
  const tagEntries = Object.entries(tags.value);
  // convert to objects with key title
  function filterByTags(event, value) {
    value = value.map((v) => v[0]);
    console.log("filterByTags", value);
    tagIncludeFilter.value = [1];
  }
  // const tagObjs = tagNames.map((name) => ({ title: name }));
  return (
    <Autocomplete
      multiple
      id="tags-outlined"
      options={tagEntries}
      onChange={filterByTags}
      // getOptionLabel={(option) => option.title}
      getOptionLabel={(option) => option[1]}
      defaultValue={[]}
      filterSelectedOptions
      renderInput={(params) => (
        <TextField {...params} label="Include Tags" placeholder="Tags" />
      )}
    />
  );
}

// Top 100 films as rated by IMDb users. http://www.imdb.com/chart/top
const top100Films = [
  { title: "The Shawshank Redemption", year: 1994 },
  { title: "The Godfather", year: 1972 },
  { title: "The Godfather: Part II", year: 1974 },
  { title: "The Dark Knight", year: 2008 },
  { title: "12 Angry Men", year: 1957 },
  { title: "Schindler's List", year: 1993 },
  { title: "Pulp Fiction", year: 1994 },
  {
    title: "The Lord of the Rings: The Return of the King",
    year: 2003,
  },
  { title: "The Good, the Bad and the Ugly", year: 1966 },
  { title: "Fight Club", year: 1999 },
  {
    title: "The Lord of the Rings: The Fellowship of the Ring",
    year: 2001,
  },
  {
    title: "Star Wars: Episode V - The Empire Strikes Back",
    year: 1980,
  },
  { title: "Forrest Gump", year: 1994 },
  { title: "Inception", year: 2010 },
  {
    title: "The Lord of the Rings: The Two Towers",
    year: 2002,
  },
  { title: "One Flew Over the Cuckoo's Nest", year: 1975 },
  { title: "Goodfellas", year: 1990 },
  { title: "The Matrix", year: 1999 },
  { title: "Seven Samurai", year: 1954 },
  {
    title: "Star Wars: Episode IV - A New Hope",
    year: 1977,
  },
  { title: "City of God", year: 2002 },
  { title: "Se7en", year: 1995 },
  { title: "The Silence of the Lambs", year: 1991 },
  { title: "It's a Wonderful Life", year: 1946 },
  { title: "Life Is Beautiful", year: 1997 },
  { title: "The Usual Suspects", year: 1995 },
  { title: "Léon: The Professional", year: 1994 },
  { title: "Spirited Away", year: 2001 },
  { title: "Saving Private Ryan", year: 1998 },
  { title: "Once Upon a Time in the West", year: 1968 },
  { title: "American History X", year: 1998 },
  { title: "Interstellar", year: 2014 },
  { title: "Casablanca", year: 1942 },
  { title: "City Lights", year: 1931 },
  { title: "Psycho", year: 1960 },
  { title: "The Green Mile", year: 1999 },
  { title: "The Intouchables", year: 2011 },
  { title: "Modern Times", year: 1936 },
  { title: "Raiders of the Lost Ark", year: 1981 },
  { title: "Rear Window", year: 1954 },
  { title: "The Pianist", year: 2002 },
  { title: "The Departed", year: 2006 },
  { title: "Terminator 2: Judgment Day", year: 1991 },
  { title: "Back to the Future", year: 1985 },
  { title: "Whiplash", year: 2014 },
  { title: "Gladiator", year: 2000 },
  { title: "Memento", year: 2000 },
  { title: "The Prestige", year: 2006 },
  { title: "The Lion King", year: 1994 },
  { title: "Apocalypse Now", year: 1979 },
  { title: "Alien", year: 1979 },
  { title: "Sunset Boulevard", year: 1950 },
  {
    title:
      "Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb",
    year: 1964,
  },
  { title: "The Great Dictator", year: 1940 },
  { title: "Cinema Paradiso", year: 1988 },
  { title: "The Lives of Others", year: 2006 },
  { title: "Grave of the Fireflies", year: 1988 },
  { title: "Paths of Glory", year: 1957 },
  { title: "Django Unchained", year: 2012 },
  { title: "The Shining", year: 1980 },
  { title: "WALL·E", year: 2008 },
  { title: "American Beauty", year: 1999 },
  { title: "The Dark Knight Rises", year: 2012 },
  { title: "Princess Mononoke", year: 1997 },
  { title: "Aliens", year: 1986 },
  { title: "Oldboy", year: 2003 },
  { title: "Once Upon a Time in America", year: 1984 },
  { title: "Witness for the Prosecution", year: 1957 },
  { title: "Das Boot", year: 1981 },
  { title: "Citizen Kane", year: 1941 },
  { title: "North by Northwest", year: 1959 },
  { title: "Vertigo", year: 1958 },
  {
    title: "Star Wars: Episode VI - Return of the Jedi",
    year: 1983,
  },
  { title: "Reservoir Dogs", year: 1992 },
  { title: "Braveheart", year: 1995 },
  { title: "M", year: 1931 },
  { title: "Requiem for a Dream", year: 2000 },
  { title: "Amélie", year: 2001 },
  { title: "A Clockwork Orange", year: 1971 },
  { title: "Like Stars on Earth", year: 2007 },
  { title: "Taxi Driver", year: 1976 },
  { title: "Lawrence of Arabia", year: 1962 },
  { title: "Double Indemnity", year: 1944 },
  {
    title: "Eternal Sunshine of the Spotless Mind",
    year: 2004,
  },
  { title: "Amadeus", year: 1984 },
  { title: "To Kill a Mockingbird", year: 1962 },
  { title: "Toy Story 3", year: 2010 },
  { title: "Logan", year: 2017 },
  { title: "Full Metal Jacket", year: 1987 },
  { title: "Dangal", year: 2016 },
  { title: "The Sting", year: 1973 },
  { title: "2001: A Space Odyssey", year: 1968 },
  { title: "Singin' in the Rain", year: 1952 },
  { title: "Toy Story", year: 1995 },
  { title: "Bicycle Thieves", year: 1948 },
  { title: "The Kid", year: 1921 },
  { title: "Inglourious Basterds", year: 2009 },
  { title: "Snatch", year: 2000 },
  { title: "3 Idiots", year: 2009 },
  { title: "Monty Python and the Holy Grail", year: 1975 },
];
