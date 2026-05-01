from hexgame.models import *
from django import forms
from django.contrib.auth import get_user_model

User = get_user_model()

class CreateGameForm(forms.Form):
    title = forms.CharField(required=True)
    usernames = forms.CharField(
        help_text="Enter usernames separated by commas. (Yours is automatically included, do not add your own username.)"
    )

    minutes_per_turn = forms.IntegerField(min_value=1, max_value=200, initial=10, required=False)
    celldata = forms.CharField(widget=forms.HiddenInput(), required=True)
    cell_count = forms.IntegerField(min_value=10, max_value=200, initial=70)
    spectatable = forms.BooleanField(required=False, initial=True)

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

class GameInfoForm(forms.ModelForm):

    class Meta:
        model = Game
        fields = ["title", "spectatable"]
