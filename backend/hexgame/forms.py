from django import forms
from django.contrib.auth import get_user_model

User = get_user_model()

class CreateGameForm(forms.Form):
    usernames = forms.CharField(
        help_text="Enter usernames separated by commas."
    )
    minutes_per_turn = forms.IntegerField(min_value=1, max_value=200)
    kick_if_inactive = forms.BooleanField(required=False)
    celldata = forms.CharField(widget=forms.HiddenInput(), required=True)

    def clean_usernames(self):
        raw_value = self.cleaned_data["usernames"]

        usernames = [u.strip() for u in raw_value.split(",") if u.strip()]
        if not usernames:
            raise forms.ValidationError("Enter at least one username.")

        # Optional: prevent duplicates in the submitted list
        duplicates_removed = list(dict.fromkeys(usernames))
        if len(duplicates_removed) != len(usernames):
            raise forms.ValidationError("Duplicate usernames were entered.")

        users = list(User.objects.filter(username__in=usernames))
        found_usernames = {user.username for user in users}

        missing = [username for username in usernames if username not in found_usernames]
        if missing:
            raise forms.ValidationError(
                f"These users do not exist: {', '.join(missing)}"
            )

        return users
